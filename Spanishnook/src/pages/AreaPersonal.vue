<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-pa-lg q-mb-md">
      <div class="col-auto">
        <q-btn color="primary" label="Nueva Reserva" icon="add" to="/Reservas" size="md" />
      </div>

      <div class="col text-center">
        <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
          ¡{{ t('personal.hola') }} {{ user.user_metadata.nombre }}!
          {{ t('personal.bienvenidoAreaPersonal') }}
        </p>
        <p v-else-if="user?.email" class="subtitulo-responsivo">
          Bienvenido {{ user.email }} {{ t('personal.bienvenidoAreaPersonal') }}
        </p>
        <p v-else class="subtitulo-responsivo">{{ t('personal.holaUsuario') }}</p>
      </div>

      <div class="col-auto">
        <q-btn
          color="negative"
          label="Cerrar sesión"
          icon="logout"
          @click="handleLogout"
          :loading="loading"
          size="md"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div :class="['menu-lateral', $q.screen.lt.md ? 'col-12' : 'col-3']">
        <div v-if="$q.screen.lt.md" class="flex justify-center q-mb-md">
          <q-btn
            flat
            :icon="menuVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            :label="menuVisible ? 'Ocultar menú' : 'Mostrar menú'"
            @click="menuVisible = !menuVisible"
            color="primary"
            class="full-width"
          />
        </div>

        <q-card v-show="menuVisible || $q.screen.gt.sm" class="menu-card q-mb-md">
          <q-list bordered class="rounded-borders">
            <q-item-label header class="text-weight-bold text-primary"> Mis Clases </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'reservadas'"
              @click="seleccionarMenu('reservadas')"
              active-class="menu-activo"
            >
              <q-item-section avatar><q-icon name="event" color="primary" /></q-item-section>
              <q-item-section>Clases Reservadas</q-item-section>
              <q-item-section side>
                <q-badge v-if="reservasConfirmadas.length > 0" color="positive" rounded>{{
                  reservasConfirmadas.length
                }}</q-badge>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'cursos'"
              @click="seleccionarMenu('cursos')"
              active-class="menu-activo"
            >
              <q-item-section avatar><q-icon name="school" color="primary" /></q-item-section>
              <q-item-section>Mis Cursos</q-item-section>
              <q-item-section side>
                <q-badge
                  v-if="
                    misSuscripciones.length > 0 &&
                    misSuscripciones.some((s) => s.estado === 'active')
                  "
                  color="positive"
                  rounded
                  >Active</q-badge
                >
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'historial'"
              @click="seleccionarMenu('historial')"
              active-class="menu-activo"
            >
              <q-item-section avatar><q-icon name="history" color="primary" /></q-item-section>
              <q-item-section>Historial de Clases</q-item-section>
            </q-item>

            <q-separator />

            <q-item-label header class="text-weight-bold text-primary"> Mi Cuenta </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'datos'"
              @click="seleccionarMenu('datos')"
              active-class="menu-activo"
            >
              <q-item-section avatar><q-icon name="person" color="primary" /></q-item-section>
              <q-item-section>Datos Personales</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'eliminar'"
              @click="seleccionarMenu('eliminar')"
              active-class="menu-activo"
            >
              <q-item-section avatar
                ><q-icon name="delete_forever" color="negative"
              /></q-item-section>
              <q-item-section>Eliminar Cuenta</q-item-section>
            </q-item>

            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'admin'"
              @click="irAPanelAdmin"
              active-class="menu-activo"
            >
              <q-item-section avatar
                ><q-icon name="admin_panel_settings" color="red"
              /></q-item-section>
              <q-item-section
                ><span class="text-weight-bold text-red"
                  >Panel de Administración</span
                ></q-item-section
              >
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div :class="[$q.screen.lt.md ? 'col-12' : 'col-9']">
        <div v-if="menuActivo === 'reservadas' || menuActivo === ''">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Mis Reservas Confirmadas</div>
            </q-card-section>

            <q-card-section>
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
                      :label="!puedeCancelar(reserva) ? 'Bloqueado' : 'Cancelar'"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <p v-else class="text-grey">No tienes reservas confirmadas.</p>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="menuActivo === 'cursos'">
          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">Mis Suscripciones Activas</div>
                <q-btn flat icon="refresh" round color="primary" @click="cargarSuscripciones" />
              </div>
            </q-card-section>

            <q-card-section>
              <q-list bordered separator v-if="misSuscripciones.length > 0" class="rounded-borders">
                <q-item v-for="sub in misSuscripciones" :key="sub.id">
                  <q-item-section avatar>
                    <q-icon
                      :name="sub.cancel_at_period_end ? 'event_busy' : 'check_circle'"
                      :color="sub.cancel_at_period_end ? 'orange' : 'positive'"
                      size="md"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-h6 text-primary text-weight-bold cursor-pointer hover-link"
                      @click="router.push(`/ReservasCursos?id=${sub.course_id}`)"
                    >
                      {{ sub.cursos_grupales?.nombre_curso || 'Curso sin nombre' }}
                    </q-item-label>

                    <q-item-label
                      v-if="sub.cursos_grupales?.horarios_curso"
                      class="text-subtitle2 text-grey-9 q-mb-xs"
                    >
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      {{ sub.cursos_grupales.dias_semana?.join(', ') }} a las
                      {{ sub.cursos_grupales.horarios_curso?.join(', ') }}
                    </q-item-label>

                    <q-item-label caption>
                      <q-badge :color="sub.estado === 'active' ? 'positive' : 'grey'">
                        {{ sub.estado }}
                      </q-badge>
                      <q-badge v-if="sub.cancel_at_period_end" color="orange" class="q-ml-sm">
                        Cancelación programada
                      </q-badge>
                    </q-item-label>
                    <q-item-label caption class="text-grey-8 q-mt-xs">
                      {{
                        sub.cancel_at_period_end ? 'Acceso válido hasta:' : 'Próxima renovación:'
                      }}
                      <strong>{{ formatearFechaSuscripcion(sub.current_period_end) }}</strong>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn
                        v-if="!sub.cancel_at_period_end && sub.estado === 'active'"
                        outline
                        color="negative"
                        label="Cancelar"
                        size="sm"
                        @click="confirmarCancelacion(sub)"
                        :loading="procesando"
                      />
                      <q-btn
                        v-if="sub.cancel_at_period_end && sub.estado === 'active'"
                        outline
                        color="positive"
                        label="Reactivar"
                        size="sm"
                        @click="reactivarSuscripcion(sub)"
                        :loading="procesando"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else class="text-center text-grey q-pa-lg border-dashed">
                <q-icon name="school" size="50px" color="grey-4" />
                <p class="q-mt-sm">No tienes ninguna suscripción activa actualmente.</p>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-card v-if="menuActivo === 'datos'">
          <q-card-section>
            <div class="text-h6 q-mb-md">Datos Personales</div>
            <q-form @submit="enviarDatosPersonales" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formDatos.nombre"
                    label="Nombre *"
                    outlined
                    :rules="[(val) => !!val || 'El nombre es obligatorio']"
                  />
                  <q-input v-model="formDatos.apellido1" label="Primer Apellido" outlined />
                  <q-input v-model="formDatos.apellido2" label="Segundo Apellido" outlined />
                  <q-input v-model="formDatos.direccion" label="Dirección" outlined />
                  <q-input
                    v-model="formDatos.codigoPostal"
                    label="Código Postal"
                    outlined
                    mask="#####"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="formDatos.ciudad" label="Ciudad" outlined />
                  <q-select v-model="formDatos.pais" :options="paises" label="País" outlined />
                  <q-input v-model="formDatos.nif" label="NIF/NIE" outlined mask="XXXXXXXXX" />
                  <q-input
                    v-model="formDatos.email"
                    label="Correo Electrónico *"
                    type="email"
                    outlined
                    :rules="[(val) => (!!val && /.+@.+\..+/.test(val)) || 'Email debe ser válido']"
                  />
                  <q-input
                    v-model="formDatos.telefono"
                    label="Teléfono"
                    outlined
                    mask="### ### ###"
                  />
                </div>
              </div>
              <q-input
                v-model="formDatos.observaciones"
                label="Observaciones"
                outlined
                type="textarea"
                rows="3"
              />
              <div class="row q-gutter-md q-mt-lg">
                <q-btn
                  label="Validar Datos"
                  color="info"
                  @click="validarDatos"
                  icon="check_circle"
                />
                <q-btn label="Guardar Cambios" type="submit" color="primary" icon="save" />
                <q-btn label="Limpiar" color="grey" @click="limpiarFormulario" icon="clear" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <q-card v-if="menuActivo === 'historial'">
          <q-card-section>
            <div class="text-h6">Tu historial de Clases</div>
          </q-card-section>
          <q-card-section>
            <q-list bordered v-if="reservasPasadas.length > 0">
              <q-item v-for="reserva in reservasPasadas" :key="reserva.id" class="q-mb-sm">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ formatFecha(reserva.fecha) }} a las {{ reserva.hora.slice(0, 5) }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ getTipoClaseTexto(reserva) }} - {{ getPrecioClase(reserva) }}€
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <p v-else class="text-grey">No tienes clases en tu historial.</p>
          </q-card-section>
        </q-card>

        <q-card v-if="menuActivo === 'eliminar'">
          <q-card-section>
            <div class="text-h6 q-mb-md">Eliminar Cuenta</div>
            <q-form @submit="eliminarCuenta" class="q-gutter-md">
              <q-input
                v-model="passwordConfirm"
                type="password"
                label="Confirma tu contraseña"
                outlined
                required
              />
              <div class="row q-gutter-md q-mt-lg">
                <q-btn
                  label="Eliminar Cuenta"
                  type="submit"
                  color="negative"
                  icon="delete_forever"
                  :loading="deleting"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { jwtDecode } from 'jwt-decode';
import { ref, onMounted, computed } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
// ✨ IMPORTAMOS EL COMPOSABLE DE SUSCRIPCIONES
import { useSuscripciones } from 'src/composables/useSuscripciones';

const $q = useQuasar();
const { user, logout } = useAuth();
const router = useRouter();
const { t } = useI18n();

// COMPOSABLE SUSCRIPCIONES (Solo para cancelar/reactivar, no para comprar)
const { procesando, cambiarEstadoCancelacion } = useSuscripciones();

// --- ESTADOS ---
const loading = ref(false);
const reservasConfirmadas = ref<Reserva[]>([]);
const reservasPasadas = ref<Reserva[]>([]);
const menuVisible = ref($q.screen.gt.sm);
const menuActivo = ref('reservadas');
const passwordConfirm = ref('');
const deleting = ref(false);

interface Suscripcion {
  id: string;
  course_id: number;
  stripe_subscription_id: string;
  estado: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  cursos_grupales?: {
    nombre_curso: string;
    dias_semana: string[];
    horarios_curso: string[];
  };
}
const misSuscripciones = ref<Suscripcion[]>([]);

// =================== LÓGICA DE SUSCRIPCIONES ===================

const cargarSuscripciones = async () => {
  if (!user.value) return;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      cursos_grupales!course_id (
        nombre_curso,
        dias_semana,
        horarios_curso
      )
    `,
    )
    .eq('user_id', user.value?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ERROR EN SUSCRIPCIONES:', error.message);
    return;
  }

  if (data) {
    // IMPORTANTE: Mapear con los nombres nuevos
    misSuscripciones.value = data.map((sub) => ({
      ...sub,
      cursos_grupales: sub.cursos_grupales || {
        nombre_curso: 'Curso no encontrado',
        dias_semana: [],
        horarios_curso: [],
      },
    })) as Suscripcion[];
  }
};

const confirmarCancelacion = (sub: Suscripcion) => {
  const fechaFin = formatearFechaSuscripcion(sub.current_period_end);
  $q.dialog({
    title: '¿Cancelar Suscripción?',
    message: `Seguirás teniendo acceso al curso hasta el <b>${fechaFin}</b>, pero no se te volverá a cobrar.`,
    html: true,
    persistent: true,
    ok: { label: 'Sí, cancelar', color: 'negative', flat: true },
    cancel: { label: 'Volver', color: 'primary' },
  }).onOk(() => {
    void (async () => {
      const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, true);
      if (exito) await cargarSuscripciones();
    })();
  });
};

const reactivarSuscripcion = async (sub: Suscripcion) => {
  const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, false);
  if (exito) await cargarSuscripciones();
};

const formatearFechaSuscripcion = (fecha: string) => {
  if (!fecha) return '---';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

// =================== LÓGICA DE USUARIO Y RESERVAS ===================

const eliminarCuenta = async () => {
  if (!user.value?.email || !user.value?.id) {
    $q.notify({
      type: 'negative',
      message: 'No se encontró el usuario autenticado.',
      timeout: 3000,
    });
    return;
  }
  if (!passwordConfirm.value) {
    $q.notify({
      type: 'warning',
      message: 'Introduce tu contraseña para confirmar.',
      timeout: 3000,
    });
    return;
  }
  deleting.value = true;
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: passwordConfirm.value,
    });
    if (signInError) {
      $q.notify({ type: 'negative', message: 'Contraseña incorrecta.', timeout: 3000 });
      return;
    }
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Error eliminando la cuenta',
        timeout: 4000,
      });
      return;
    }
    $q.notify({ type: 'positive', message: 'Tu cuenta ha sido eliminada.', timeout: 3000 });
    await logout();
    await router.push('/');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    $q.notify({ type: 'negative', message, timeout: 4000 });
  } finally {
    deleting.value = false;
  }
};

const cargarDatosPersonales = async () => {
  if (!user.value?.id) return;

  try {
    const { data, error } = await supabase
      .from('datos_usuarios')
      .select('*')
      .eq('user_id', user.value.id)
      .single();

    if (error && error.code !== 'PGRST116') return;

    if (data) {
      formDatos.value = {
        nombre: data.nombre || '',
        apellido1: data.apellido1 || '',
        apellido2: data.apellido2 || '',
        direccion: data.direccion || '',
        codigoPostal: data.codigo_postal || '',
        ciudad: data.ciudad || '',
        pais: data.pais || null,
        nif: data.nif || '',
        email: data.email || '',
        telefono: data.telefono || '',
        observaciones: data.observaciones || '',
      };
    } else {
      formDatos.value.email = user.value.email || '';
    }
  } catch (error) {
    console.error('Error cargando datos personales:', error);
  }
};

// Computed para verificar si es admin basándose en JWT
const sessionToken = ref<string | null>(null);

const esAdmin = computed(() => {
  if (!sessionToken.value) return false;

  try {
    const payload = jwtDecode<{ app_metadata?: { is_admin?: boolean } }>(sessionToken.value);
    console.log('Payload del token:', payload);
    return Boolean(payload.app_metadata?.is_admin);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return false;
  }
});

const cargarSesion = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    sessionToken.value = session?.access_token || null;
  } catch (error) {
    console.error('Error cargando sesión:', error);
    sessionToken.value = null;
  }
};

const cargarReservasPasadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .lt('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });
    reservasPasadas.value = data || [];
  } catch (error) {
    console.error(error);
  }
};

interface DatosUsuario {
  nombre: string;
  apellido1: string;
  apellido2: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  pais: string | null;
  nif: string;
  email: string;
  telefono: string;
  observaciones: string;
  [key: string]: string | null;
}

const formDatos = ref<DatosUsuario>({
  nombre: '',
  apellido1: '',
  apellido2: '',
  direccion: '',
  codigoPostal: '',
  ciudad: '',
  pais: null,
  nif: '',
  email: '',
  telefono: '',
  observaciones: '',
});
const paises = [
  'España',
  'Portugal',
  'Francia',
  'Italia',
  'Alemania',
  'Reino Unido',
  'Estados Unidos',
  'México',
  'Argentina',
  'Colombia',
  'Chile',
  'Perú',
];

const irAPanelAdmin = async () => {
  await router.push('/Administracion');
};

const validarDatos = () => {
  if (!formDatos.value.nombre || !formDatos.value.email) {
    $q.notify({ type: 'warning', message: 'Faltan campos obligatorios', timeout: 3000 });
  } else {
    $q.notify({ type: 'positive', message: 'Datos válidos', timeout: 3000 });
  }
};

const enviarDatosPersonales = async () => {
  try {
    const datosAEnviar = {
      user_id: user.value?.id,
      nombre: formDatos.value.nombre,
      apellido1: formDatos.value.apellido1,
      apellido2: formDatos.value.apellido2,
      direccion: formDatos.value.direccion,
      codigo_postal: formDatos.value.codigoPostal,
      ciudad: formDatos.value.ciudad,
      pais: formDatos.value.pais,
      nif: formDatos.value.nif,
      email: formDatos.value.email,
      telefono: formDatos.value.telefono,
      observaciones: formDatos.value.observaciones,
    };

    const { error } = await supabase
      .from('datos_usuarios')
      .upsert([datosAEnviar], { onConflict: 'email' });

    if (error) throw error;

    $q.notify({ type: 'positive', message: 'Datos guardados correctamente', timeout: 3000 });
  } catch (error) {
    console.error('Error al guardar:', error);
    $q.notify({ type: 'negative', message: 'Error al guardar los datos', timeout: 3000 });
  }
};

const limpiarFormulario = () => {
  Object.keys(formDatos.value).forEach((key) => {
    formDatos.value[key] = '';
  });
  formDatos.value.pais = null;
};

// Función para seleccionar menú
const seleccionarMenu = (menu: string) => {
  menuActivo.value = menu;
  if (menu === 'historial') void cargarReservasPasadas();
  else if (menu === 'datos') void cargarDatosPersonales();
  else if (menu === 'cursos') {
    void cargarSuscripciones();
  }
  if ($q.screen.lt.md) menuVisible.value = false;
};

// Resto de interfaces y funciones de reservas
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

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getTipoClaseTexto = (reserva: Reserva): string =>
  reserva.tipo === 'normal' ? 'Clase Normal' : 'Clase Conversación';
const getPrecioClase = (reserva: Reserva): number => (reserva.tipo === 'normal' ? 32 : 20);

const puedeCancelar = (reserva: Reserva): boolean => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  return (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60) >= 72;
};

const cargarReservasConfirmadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    reservasConfirmadas.value = data || [];
  } catch (error) {
    console.error(error);
  }
};

const cancelarReserva = (reserva: Reserva) => {
  $q.dialog({
    title: 'Cancelar reserva',
    message: `¿Estás seguro de que quieres cancelar la reserva del ${formatFecha(reserva.fecha)} a las ${reserva.hora.slice(0, 5)}? Se procesará un reembolso.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cancel-reserva', {
          body: { reservaId: reserva.id },
        });
        if (error || data?.error) throw new Error(error?.message || data?.error);
        reservasConfirmadas.value = reservasConfirmadas.value.filter((r) => r.id !== reserva.id);
        $q.notify({
          type: 'positive',
          message: data?.message || 'Reserva cancelada',
          timeout: 5000,
        });
      } catch (err: unknown) {
        $q.notify({
          type: 'negative',
          message: err instanceof Error ? err.message : 'Error al cancelar',
          timeout: 6000,
        });
      }
    })();
  });
};

const handleLogout = async () => {
  loading.value = true;
  try {
    await logout();
    await router.push('/');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void cargarReservasConfirmadas();
  void cargarSesion();
});
</script>

<style scoped>
.hover-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}
.border-dashed {
  border: 2px dashed #ccc;
  border-radius: 8px;
}
.menu-activo {
  background-color: #fce4ec; /* Un tono suave de tu color primario */
  color: #851319;
  border-right: 3px solid #851319;
}
</style>
