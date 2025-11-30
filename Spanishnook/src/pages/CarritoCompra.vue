<template>
  <q-page class="q-pa-lg">
    <h4>🛒 Carrito de Reservas</h4>

    <div v-if="carrito.length === 0" class="text-center q-mt-xl">
      <q-icon name="shopping_cart" size="100px" color="grey-4" />
      <p class="text-grey q-mt-md">Tu carrito está vacío</p>
      <q-btn
        color="primary"
        label="Ir a Clases individuales"
        to="/ClasesIndividuales"
        class="q-mt-md"
      />
    </div>

    <div v-else>
      <q-list bordered class="q-mb-lg">
        <q-item
          v-for="(reserva, index) in carrito"
          :key="index"
          class="q-mb-sm"
          :class="{ 'bg-negative-1': esReservaConflictiva(reserva) }"
        >
          <q-item-section>
            <q-item-label class="text-h6" :class="{ 'text-white': esReservaConflictiva(reserva) }">
              {{ formatFecha(reserva.fecha) }} a las {{ reserva.hora }}
            </q-item-label>
            <q-item-label caption :class="{ 'text-white': esReservaConflictiva(reserva) }">
              {{ reserva.tipo === 'normal' ? 'Clase Normal' : 'Clase Conversación' }} -
              {{ reserva.tipo === 'normal' ? '32€' : '20€' }}
            </q-item-label>
            <q-item-label v-if="esReservaConflictiva(reserva)" class="text-white">
              ⚠️ Esta hora ya está ocupada
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              color="negative"
              icon="delete"
              @click="quitarDelCarrito(index)"
              round
              flat
              :class="{ 'text-white': esReservaConflictiva(reserva) }"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="bg-yellow-2 q-pa-md rounded-borders q-mb-lg">
        <h6>Resumen del Pedido</h6>
        <div class="row justify-between items-center">
          <span>{{ carrito.length }} reserva(s)</span>
          <span class="text-h6 text-primary">Total estimado: {{ total }}€</span>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          {{ totalNormal }} clase(s) normal(es) + {{ totalConversacion }} clase(s) conversación
        </div>
        <div v-if="reservasConflictivas.length > 0" class="text-negative q-mt-sm">
          ⚠️ {{ reservasConflictivas.length }} reserva(s) no disponible(s)
        </div>
      </div>

      <div class="row q-gutter-md justify-end">
        <q-btn color="grey" label="Seguir Reservando" to="/ClasesIndividuales" outline />
        <q-btn
          color="primary"
          label="Pagar y Confirmar Reservas"
          @click="confirmarReservas"
          :disable="!usuarioLogueado || reservasConflictivas.length > 0"
          :loading="confirmando"
        />
      </div>

      <q-banner v-if="!usuarioLogueado" class="bg-warning text-dark q-mt-md">
        ⚠️ Debes iniciar sesión para confirmar reservas
      </q-banner>

      <q-banner v-if="reservasConflictivas.length > 0" class="bg-negative text-white q-mt-md">
        <template v-if="reservasConflictivas.length === 1 && reservasConflictivas[0]">
          ⚠️ La hora {{ reservasConflictivas[0].hora }} del
          {{ formatFecha(reservasConflictivas[0].fecha) }} ya está ocupada. Por favor, elimínala de
          tu carrito.
        </template>
        <template v-else-if="reservasConflictivas.length > 1">
          ⚠️ Las siguientes horas ya están ocupadas:
          <ul class="q-mt-sm">
            <li v-for="(reserva, index) in reservasConflictivas" :key="index">
              {{ reserva.hora }} del {{ formatFecha(reserva.fecha) }}
            </li>
          </ul>
          Por favor, elimínalas de tu carrito.
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';

const { user } = useAuth();

interface ReservaCarrito {
  fecha: string;
  hora: string;
  tipo: 'normal' | 'conversacion';
}

const carrito = ref<ReservaCarrito[]>([]);
const confirmando = ref(false);
const reservasConflictivas = ref<ReservaCarrito[]>([]);

// Computed properties
const usuarioLogueado = computed(() => !!user.value?.id);

// Calcular total (Solo visual, el cobro real lo hace el backend)
const total = computed(() => {
  return carrito.value.reduce((sum, reserva) => {
    return sum + (reserva.tipo === 'normal' ? 32 : 20);
  }, 0);
});

// Contadores por tipo
const totalNormal = computed(() => {
  return carrito.value.filter((reserva) => reserva.tipo === 'normal').length;
});

const totalConversacion = computed(() => {
  return carrito.value.filter((reserva) => reserva.tipo === 'conversacion').length;
});

// Verificar si una reserva es conflictiva
const esReservaConflictiva = (reserva: ReservaCarrito) => {
  return reservasConflictivas.value.some(
    (conflictiva) => conflictiva?.fecha === reserva.fecha && conflictiva?.hora === reserva.hora,
  );
};

// Cargar carrito desde localStorage
const cargarCarrito = () => {
  const carritoGuardado = localStorage.getItem('carritoReservas');
  if (carritoGuardado) {
    try {
      carrito.value = JSON.parse(carritoGuardado);
    } catch (error) {
      console.error('Error parsing carrito:', error);
      carrito.value = [];
    }
  }
};

// Guardar carrito en localStorage
const guardarCarrito = () => {
  localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
};

// Formatear fecha
const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Quitar reserva del carrito
const quitarDelCarrito = (index: number) => {
  if (index < 0 || index >= carrito.value.length) return;

  const reservaEliminada = carrito.value[index];
  if (!reservaEliminada) return;

  carrito.value.splice(index, 1);
  guardarCarrito();

  // Eliminar también de las conflictivas si estaba ahí
  reservasConflictivas.value = reservasConflictivas.value.filter(
    (conflictiva) =>
      conflictiva &&
      !(conflictiva.fecha === reservaEliminada.fecha && conflictiva.hora === reservaEliminada.hora),
  );
};

// Verificar disponibilidad de TODAS las reservas
const verificarDisponibilidad = async () => {
  try {
    if (carrito.value.length === 0) {
      reservasConflictivas.value = [];
      return;
    }

    const horasParaVerificar = carrito.value.map((reserva) => ({
      fecha: reserva.fecha,
      hora: reserva.hora + ':00',
    }));

    const { data: reservasOcupadas, error } = await supabase
      .from('reservas')
      .select('fecha, hora')
      .eq('estado', 'confirmada')
      .in('fecha', [...new Set(horasParaVerificar.map((h) => h.fecha))])
      .in('hora', [...new Set(horasParaVerificar.map((h) => h.hora))]);

    if (error) throw error;

    reservasConflictivas.value =
      carrito.value.filter((reserva) => {
        const horaBD = reserva.hora + ':00';
        return reservasOcupadas?.some(
          (ocupada) => ocupada?.fecha === reserva.fecha && ocupada?.hora === horaBD,
        );
      }) || [];
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    alert('Error al verificar disponibilidad. Por favor, intenta nuevamente.');
  }
};

// --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
// Confirmar reservas y crear sesión de Stripe (Seguro)
const confirmarReservas = async () => {
  if (!usuarioLogueado.value || reservasConflictivas.value.length > 0) return;
  confirmando.value = true;

  try {
    // 1. Preparamos solo los metadatos necesarios
    // Ya NO enviamos precios ni line_items desde aquí por seguridad
    const reservasMetadata = carrito.value.map((r) => ({
      fecha: r.fecha,
      hora: r.hora,
      tipo: r.tipo,
    }));

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Usuario no autenticado');

    // 2. Llamamos a la Edge Function
    const res = await fetch(
      'https://zleqsdfpjepdangitcxv.supabase.co/functions/v1/stripe-webhook',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reservas: reservasMetadata, // Solo enviamos la lista de lo que quiere
          user_id: user.value!.id,
        }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al crear la sesión de pago');
    }

    const responseData = await res.json();
    if (!responseData.url) throw new Error('No se pudo obtener la URL de Stripe Checkout');

    // 3. Redirigimos a Stripe
    window.location.href = responseData.url;
  } catch (err: unknown) {
    let mensaje = 'Error al confirmar reservas';
    if (err instanceof Error) mensaje = err.message;
    console.error('❌ Error:', err);
    alert(mensaje);
  } finally {
    confirmando.value = false;
  }
};

onMounted(() => {
  cargarCarrito();
  void verificarDisponibilidad();
});
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
</style>
