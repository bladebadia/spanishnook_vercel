<template>
  <q-page class="q-pa-lg">
    <div
      class="titulo-responsivo2 row items-center justify-between q-mb-md"
      style="font-size: 2.3rem; font-weight: 800"
    >
      🛒 {{ t('carrito.carritoDeReservas') }}

      <div style="min-width: 250px" v-if="usuarioLogueado">
        <SaldoWallet
          :saldo-normal="saldoNormal"
          :saldo-conversacion="saldoConversacion"
          :loading="cargandoSaldo"
        />

        <div class="q-mt-sm text-right">
          <q-checkbox
            v-model="usarCreditosGlobal"
            label="Utilizar créditos disponibles"
            color="green"
            dense
            class="checkbox-creditos"
            @update:model-value="recalcularAplicacionCreditos"
            :disable="saldoNormal === 0 && saldoConversacion === 0"
          />
        </div>
      </div>
    </div>

    <div v-if="carrito.length === 0" class="text-center q-mt-xl">
      <q-icon name="shopping_cart" size="100px" color="grey-4" />
      <p class="text-grey q-mt-md">{{ t('carrito.tuCarritoEstaVacio') }}</p>
      <q-btn color="primary" :label="t('carrito.reservarClases')" to="/Reservas" class="q-mt-md" />
    </div>

    <div v-else>
      <q-list bordered class="q-mb-lg separator">
        <q-item
          v-for="(reserva, index) in carrito"
          :key="index"
          class="q-py-md"
          :class="{ 'bg-negative-1': esReservaConflictiva(reserva) }"
        >
          <div class="row full-width items-center justify-between">
            <div class="col-grow">
              <div class="resumen-fecha" :class="{ 'text-white': esReservaConflictiva(reserva) }">
                {{ formatFecha(reserva.fecha) }} - {{ reserva.hora }}
              </div>
              <div class="text-caption" :class="{ 'text-white': esReservaConflictiva(reserva) }">
                {{
                  reserva.tipo === 'normal'
                    ? t('carrito.claseNormal')
                    : t('carrito.claseConversacion')
                }}
                <span
                  v-if="esReservaConflictiva(reserva)"
                  class="text-white text-weight-bold q-ml-sm"
                >
                  ⚠️ {{ t('carrito.horaOcupada') }}
                </span>
              </div>
            </div>

            <div class="col-auto text-right flex items-center q-gutter-x-md">
              <div v-if="!esReservaConflictiva(reserva)">
                <div v-if="reserva.usarCredito" class="text-green text-weight-bold text-h6">
                  0€
                  <span class="text-caption text-grey strike-through">{{
                    reserva.tipo === 'normal' ? '32€' : '27€'
                  }}</span>
                  <q-badge color="green" floating transparent rounded>CREDIT</q-badge>
                </div>
                <div v-else class="text-h6 text-primary">
                  {{ reserva.tipo === 'normal' ? '32€' : '27€' }}
                </div>
              </div>

              <q-btn
                color="negative"
                icon="delete"
                @click="quitarDelCarrito(index)"
                flat
                round
                :class="{ 'text-white': esReservaConflictiva(reserva) }"
              />
            </div>
          </div>
        </q-item>
      </q-list>

      <div class="bg-yellow-2 q-pa-md rounded-borders q-mb-lg">
        <h6 class="resumen-titulo">{{ t('carrito.resumenDelPedido') }}</h6>
        <div class="row justify-between items-center">
          <span class="numero-reservas"
            >{{ carrito.length }} {{ t('carrito.reserva', { count: carrito.length }) }}</span
          >

          <div class="text-right">
            <div class="total-precio text-primary text-weight-bold">
              Total: {{ totalPagarDinero }}€
            </div>
            <div v-if="totalGastarCreditos > 0" class="text-caption text-green">
              (Se canjearán {{ totalGastarCreditos }} créditos)
            </div>
          </div>
        </div>

        <div v-if="reservasConflictivas.length > 0" class="text-negative q-mt-sm">
          ⚠️ {{ reservasConflictivas.length }}
          {{ t('carrito.reservaNoDisponible', { count: reservasConflictivas.length }) }}
        </div>
      </div>

      <div class="row q-gutter-md justify-end">
        <q-btn color="grey" label="Seguir Reservando" to="/Reservas" outline />

        <q-btn
          color="primary"
          class="btn-confirmar"
          :label="totalPagarDinero === 0 ? 'Confirmar Canje' : t('carrito.pagarYConfirmarReservas')"
          @click="confirmarReservasHibridas"
          :disable="!usuarioLogueado || reservasConflictivas.length > 0"
          :loading="confirmando"
          :icon="totalPagarDinero === 0 ? 'check_circle' : 'credit_card'"
        />
      </div>

      <q-banner v-if="!usuarioLogueado" class="bg-warning text-dark q-mt-md">
        ⚠️ {{ t('carrito.debesIniciarSesion') }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import SaldoWallet from 'components/SaldoWallet.vue';

const { t, locale } = useI18n();
const { user } = useAuth();
const $q = useQuasar();

interface ReservaCarrito {
  fecha: string;
  hora: string;
  tipo: 'normal' | 'conversacion';
  usarCredito?: boolean;
}

interface OcupacionAnonima {
  fecha: string;
  hora: string;
}

const carrito = ref<ReservaCarrito[]>([]);
const confirmando = ref(false);
const reservasConflictivas = ref<ReservaCarrito[]>([]);

// Saldos
const saldoNormal = ref(0);
const saldoConversacion = ref(0);
const cargandoSaldo = ref(false);
const usarCreditosGlobal = ref(false); // Checkbox único

const usuarioLogueado = computed(() => !!user.value?.id);

// --- 1. CARGA INICIAL ---
onMounted(async () => {
  cargarCarrito();
  if (user.value?.id) {
    cargandoSaldo.value = true;
    try {
      const { data } = await supabase
        .from('datos_usuarios')
        .select('saldo_normal, saldo_conversacion')
        .eq('user_id', user.value.id)
        .single();

      if (data) {
        saldoNormal.value = data.saldo_normal || 0;
        saldoConversacion.value = data.saldo_conversacion || 0;
      }
    } catch (e) {
      console.error('Error cargando saldo', e);
    } finally {
      cargandoSaldo.value = false;
    }
  }
  void verificarDisponibilidad();
});

// --- 2. LÓGICA DE DISTRIBUCIÓN AUTOMÁTICA ---
const recalcularAplicacionCreditos = () => {
  // 1. Limpiamos todo primero
  carrito.value.forEach((item) => (item.usarCredito = false));

  // Si el check está apagado, nos vamos (todo queda en false)
  if (!usarCreditosGlobal.value) {
    guardarCarrito();
    return;
  }

  // 2. Contadores temporales para simular el gasto
  let disponiblesNormal = saldoNormal.value;
  let disponiblesConv = saldoConversacion.value;

  // 3. Asignar créditos inteligentemente
  carrito.value.forEach((item) => {
    if (item.tipo === 'normal') {
      if (disponiblesNormal > 0) {
        item.usarCredito = true;
        disponiblesNormal--;
      }
    } else if (item.tipo === 'conversacion') {
      if (disponiblesConv > 0) {
        item.usarCredito = true;
        disponiblesConv--;
      }
    }
  });

  guardarCarrito();
};

// --- 3. TOTALES ---
const totalPagarDinero = computed(() => {
  return carrito.value.reduce((sum, reserva) => {
    if (reserva.usarCredito) return sum;
    return sum + (reserva.tipo === 'normal' ? 32 : 27);
  }, 0);
});

const totalGastarCreditos = computed(() => carrito.value.filter((c) => c.usarCredito).length);

// --- 4. PAGO Y BASE DE DATOS ---
const confirmarReservasHibridas = async () => {
  if (!usuarioLogueado.value || reservasConflictivas.value.length > 0) return;
  confirmando.value = true;

  try {
    const itemsConCredito = carrito.value.filter((i) => i.usarCredito);
    const itemsConTarjeta = carrito.value.filter((i) => !i.usarCredito);

    // A. PAGAR CON CRÉDITOS
    if (itemsConCredito.length > 0) {
      for (const item of itemsConCredito) {
        // SQL Directo
        const { data, error } = await supabase.rpc('reservar_con_credito', {
          p_user_id: user.value!.id,
          p_tipo_clase: item.tipo,
          p_fecha: item.fecha,
          p_hora: item.hora,
          p_precio: item.tipo === 'normal' ? 32 : 27,
          p_meet_link: null,
        });

        if (error || !data.success) {
          // Si el error es controlado (ej: "Ya reservado"), viene en data.message
          throw new Error(data?.message || error?.message || 'Error desconocido');
        }

        // Generar Meet en segundo plano
        const nuevaReservaId = data.reserva_id;
        if (nuevaReservaId) {
          await supabase.functions.invoke('crear-meet', {
            body: { reservaId: nuevaReservaId },
          });
        }
      }
    }

    // B. PAGAR CON TARJETA
    if (itemsConTarjeta.length > 0) {
      await irAStripe(itemsConTarjeta);
    } else {
      $q.notify({ type: 'positive', message: '¡Reservas confirmadas!' });
      carrito.value = [];
      guardarCarrito();
      window.location.href = '/AreaPersonal';
    }
  } catch (err: unknown) {
    console.error('Error pago:', err);
    const mensaje = err instanceof Error ? err.message : 'Error procesando la reserva';
    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    confirmando.value = false;
  }
};

const irAStripe = async (items: ReservaCarrito[]) => {
  // IMPORTANTE: Aquí NO cambiamos nada del código anterior de Stripe
  // Se usa la misma lógica: Metadata + Redirección
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const reservasMetadata = items.map((r) => ({
    fecha: r.fecha,
    hora: r.hora,
    tipo: r.tipo,
  }));

  const res = await fetch('https://zleqsdfpjepdangitcxv.supabase.co/functions/v1/stripe-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      reservas: reservasMetadata,
      user_id: user.value!.id,
      user_email: user.value?.email,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error conectando con Stripe');
  }

  const responseData = await res.json();
  if (!responseData.url) throw new Error('No se obtuvo URL de Stripe');

  window.location.href = responseData.url;
};

// --- UTILIDADES ---
const cargarCarrito = () => {
  const carritoGuardado = localStorage.getItem('carritoReservas');
  if (carritoGuardado) {
    try {
      carrito.value = JSON.parse(carritoGuardado);
    } catch {
      carrito.value = [];
    }
  }
};

const guardarCarrito = () => {
  localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
};

const quitarDelCarrito = (index: number) => {
  const reservaEliminada = carrito.value[index];
  carrito.value.splice(index, 1);
  recalcularAplicacionCreditos(); // IMPORTANTE: Recalcular si borran algo

  if (reservaEliminada) {
    reservasConflictivas.value = reservasConflictivas.value.filter(
      (c) => c && !(c.fecha === reservaEliminada.fecha && c.hora === reservaEliminada.hora),
    );
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// RPC Segura para ver ocupación
const verificarDisponibilidad = async () => {
  try {
    if (carrito.value.length === 0) {
      reservasConflictivas.value = [];
      return;
    }

    const { data: todasOcupadas, error } = await supabase.rpc('obtener_ocupacion');
    if (error) throw error;

    const ocupacionReal = (todasOcupadas || []) as OcupacionAnonima[];
    reservasConflictivas.value = carrito.value.filter((itemCarrito) => {
      return ocupacionReal.some((ocupada) => {
        const horaOcupada = ocupada.hora.substring(0, 5);
        return ocupada.fecha === itemCarrito.fecha && horaOcupada === itemCarrito.hora;
      });
    });
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
  }
};

const esReservaConflictiva = (reserva: ReservaCarrito) => {
  return reservasConflictivas.value.some(
    (c) => c.fecha === reserva.fecha && c.hora === reserva.hora,
  );
};
</script>

<style scoped>
.bg-negative-1 {
  background-color: #851319;
}
.text-h6 {
  font-weight: 500;
}
.text-white {
  color: white !important;
}
.strike-through {
  text-decoration: line-through;
}
/* Separador sutil entre items */
.separator > div:not(:last-child) {
  border-bottom: 1px solid #eeeeee;
}
/* Reducir tamaño del texto del checkbox de créditos */
:deep(.checkbox-creditos .q-checkbox__label) {
  font-size: 0.875rem;
}
/* Estilo para la fecha en el resumen */
.resumen-fecha {
  font-size: 1.1rem;
  font-weight: bold;
  color: #851319;
}
.resumen-fecha.text-white {
  color: white !important;
}
/* Estilo para el título "Resumen del Pedido" */
.resumen-titulo {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  margin: 0 0 1rem 0;
}
/* Número de reservas */
.numero-reservas {
  font-size: 1.1rem;
  font-weight: 500;
}
/* Total y precio */
.total-precio {
  font-size: 1.3rem;
}
/* Botón confirmar reservas */
:deep(.btn-confirmar .q-btn__content) {
  font-weight: bold;
}
</style>
