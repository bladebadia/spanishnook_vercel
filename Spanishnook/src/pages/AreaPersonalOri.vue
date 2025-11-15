<template>
  <q-page class="q-pa-lg">
    <!-- Saludo personalizado -->
    <div class="q-pa-lg">      
      <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo text-center">¡{{t('personal.hola')}} {{ user.user_metadata.nombre }}! {{t('personal.bienvenidoAreaPersonal')}}</p>
      <p v-else-if="user?.email"  class="subtitulo-responsivo text-center">Bienvenido {{ user.email }} {{t('personal.bienvenidoAreaPersonal')}}</p>
      <p v-else class="subtitulo-responsivo text-center">{{t('personal.holaUsuario')}}</p>
    </div>
      <!-- Menú lateral debajo del header -->
    <div class="row">
      
    <div v-if="menuVisible || $q.screen.gt.sm" class="menu-lateral col-3">
      <!-- Botón de visibilidad (solo en móviles) -->
      <q-btn v-if=" $q.screen.lt.md"
        flat
        round
        icon="keyboard_arrow_down"
        class="q-mb-md "
        @click="menuVisible = !menuVisible"
        aria-label="Mostrar/Ocultar menú"
    />
      <q-list bordered>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="schedule" />
          </q-item-section>
          <q-item-section>Clases Pendientes</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>Clases Reservadas</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>Historial de Clases</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Datos Personales</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="comment" />
          </q-item-section>
          <q-item-section>Comentarios</q-item-section>
        </q-item>
      </q-list>
    </div>
    </div>

    <!-- Reservas Confirmadas -->
    <div class="q-mt-lg">
      <h5>Mis Reservas</h5>

      <q-list bordered v-if="reservasConfirmadas.length > 0">
        <q-item v-for="reserva in reservasConfirmadas" :key="reserva.id" class="q-mb-sm">
          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ formatFecha(reserva.fecha) }} a las {{ reserva.hora.slice(0, 5) }}
            </q-item-label>
            <q-item-label caption>
              {{ getTipoClaseTexto(reserva) }} - {{ getPrecioClase(reserva) }}€
            </q-item-label>
            <q-item-label caption v-if="!puedeCancelar(reserva)" class="text-negative">
              No se puede cancelar (menos de 72 horas)
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              color="negative"
              icon="delete"
              @click="cancelarReserva(reserva)"
              size="sm"
              :disable="!puedeCancelar(reserva)"
              :title="
                !puedeCancelar(reserva)
                  ? 'No se puede cancelar con menos de 72 horas de antelación'
                  : 'Cancelar reserva'
              "
              label="Cancelar"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <p v-else class="text-grey">No tienes reservas confirmadas.</p>
    </div>

    <!-- Botones de acción -->
    <div class="column items-start q-gutter-y-md q-mt-lg">
      <q-btn color="primary" label="Hacer Nueva Reserva" icon="add" to="/Reservas" />

      <q-btn
        color="negative"
        label="Cerrar sesión"
        icon="logout"
        @click="handleLogout"
        :loading="loading"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { user, logout } = useAuth();
const router = useRouter();
const loading = ref(false);
const reservasConfirmadas = ref<Reserva[]>([]);
const {  t } = useI18n();
const menuVisible = ref(false); // Estado del menú lateral

// Actualizar la interfaz Reserva para incluir tipo y precio
interface Reserva {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  estado: string;
  created_at?: string;
  tipo?: 'normal' | 'conversacion';
  precio?: number;
  stripe_payment_intent?: string;
}

// Formatear fecha
const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Función para obtener el texto del tipo de clase
const getTipoClaseTexto = (reserva: Reserva): string => {
  if (reserva.tipo) {
    return reserva.tipo === 'normal' ? 'Clase Normal' : 'Clase Conversación';
  }
  // Para reservas antiguas (sin campo tipo), asumimos que son normales
  return 'Clase Normal';
};

// Función para obtener el precio
const getPrecioClase = (reserva: Reserva): number => {
  if (reserva.tipo) {
    return reserva.tipo === 'normal' ? 32 : 20;
  }
  // Para reservas antiguas (sin campo tipo), asumimos 25€ (precio anterior)
  return 25;
};

// Función para verificar si se puede cancelar una reserva (72 horas)
const puedeCancelar = (reserva: Reserva): boolean => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  return diferenciaHoras >= 72;
};

// Cargar reservas confirmadas del usuario (incluyendo tipo y precio)
const cargarReservasConfirmadas = async () => {
  if (!user.value?.id) {
    reservasConfirmadas.value = [];
    return;
  }

  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      console.error('Error cargando reservas confirmadas:', error);
      return;
    }

    reservasConfirmadas.value = data || [];
    console.log('Reservas confirmadas cargadas:', reservasConfirmadas.value);
  } catch (error) {
    console.error('Error cargando reservas:', error);
    reservasConfirmadas.value = [];
  }
};

// Cancelar reserva con confirmación + Stripe refund
const cancelarReserva = (reserva: Reserva) => {
  // Validar 72 horas en el frontend primero
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  console.log('⏰ Validación frontend - Diferencia en horas:', diferenciaHoras);

  if (diferenciaHoras < 72) {
    const horasRestantes = Math.max(0, Math.floor(diferenciaHoras));
    $q.notify({
      type: 'negative',
      message: `No puedes cancelar con menos de 72 horas de antelación`,
      caption: `Tiempo restante: ${horasRestantes} horas`,
      timeout: 6000,
      actions: [{ icon: 'close', color: 'white' }],
    });
    return; // Detener la ejecución aquí
  }

  $q.dialog({
    title: 'Cancelar reserva',
    message: `¿Estás seguro de que quieres cancelar la reserva del ${formatFecha(reserva.fecha)} a las ${reserva.hora.slice(0, 5)}? Se procesará un reembolso.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        console.log('🔄 Enviando solicitud de cancelación para reserva:', reserva.id);

        const { data, error } = await supabase.functions.invoke('cancel-reserva', {
          body: { reservaId: reserva.id },
        });

        console.log('📨 Respuesta recibida:', { data, error });

        if (error) {
          throw new Error(error.message || 'Error desconocido en la función');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        // Actualizar la lista local
        reservasConfirmadas.value = reservasConfirmadas.value.filter((r) => r.id !== reserva.id);

        $q.notify({
          type: 'positive',
          message: data?.message || 'Reserva cancelada y reembolso realizado con éxito',
          timeout: 5000,
        });
      } catch (err: unknown) {
        console.error('💥 Error cancelando reserva:', err);
        let errorMessage = 'Error al cancelar la reserva';

        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        $q.notify({
          type: 'negative',
          message: errorMessage,
          timeout: 6000,
        });
      }
    })();
  });
};

// Cerrar sesión
const handleLogout = async () => {
  loading.value = true;
  try {
    await logout();
    await router.push('/');
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  } finally {
    loading.value = false;
  }
};

// Cargar reservas al montar el componente
onMounted(() => {
  void cargarReservasConfirmadas();
});
</script>

<style scoped>
.q-item {
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
  border-radius: 8px;
}
.q-item:last-child {
  border-bottom: none;
}
</style>
