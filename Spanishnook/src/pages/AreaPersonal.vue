<template>
  <q-page class="q-pa-lg">
    <div class="col-12 text-center">
      <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
        ¡{{ t('personal.hola') }} {{ user.user_metadata.nombre }}!
        {{ t('personal.bienvenidoAreaPersonal') }}
      </p>
      <p v-else-if="user?.email" class="subtitulo-responsivo">
        {{ t('personal.bienvenido') }} {{ user.email }} {{ t('personal.bienvenidoAreaPersonal') }}
      </p>
      <p v-else class="subtitulo-responsivo">{{ t('personal.holaUsuario') }}</p>
    </div>

    <div class="col-12 text-center q-py-md q-py-md-lg">
      <q-btn
        color="primary"
        :label="t('personal.nuevaReserva')"
        icon="add"
        to="/Reservas"
        size="md"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <div :class="['menu-lateral', $q.screen.lt.md ? 'col-12' : 'col-3']">
        <SaldoWallet
          :saldo-normal="formDatos.saldo_normal"
          :saldo-conversacion="formDatos.saldo_conversacion"
          :loading="cargandoSaldo"
        />

        <div v-if="$q.screen.lt.md" class="flex justify-center q-mb-md">
          <q-btn
            flat
            :icon="menuVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            :label="menuVisible ? t('personal.ocultarMenu') : t('personal.mostrarMenu')"
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
              <q-item-section>{{ t('personal.clasesReservadas') }}</q-item-section>
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
              <q-item-section>{{ t('personal.misCursos') }}</q-item-section>
              <q-item-section side>
                <q-badge
                  v-if="misSuscripciones.some((s) => s.estado === 'active')"
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
              <q-item-section>{{ t('personal.historialClases') }}</q-item-section>
            </q-item>

            <q-separator />
            <q-item-label header class="text-weight-bold text-primary">
              {{ t('personal.miCuenta') }}
            </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'datos'"
              @click="seleccionarMenu('datos')"
              active-class="menu-activo"
            >
              <q-item-section avatar><q-icon name="person" color="primary" /></q-item-section>
              <q-item-section>{{ t('personal.datosPersonales') }}</q-item-section>
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
              <q-item-section>{{ t('personal.eliminarCuenta') }}</q-item-section>
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
                ><span class="text-weight-bold text-red">Panel Admin</span></q-item-section
              >
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div :class="[$q.screen.lt.md ? 'col-12' : 'col-9']">
        <div v-if="menuActivo === 'reservadas' || menuActivo === ''">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">{{ t('personal.misReservasConfirmadas') }}</div>

                <div v-if="reservasConfirmadas.length > 0">
                  <q-btn
                    v-if="!modoSeleccion"
                    flat
                    dense
                    color="primary"
                    icon="checklist"
                    :label="t('personal.seleccionar') || 'Seleccionar'"
                    @click="modoSeleccion = true"
                  />
                  <div v-else class="row q-gutter-sm">
                    <q-btn
                      flat
                      dense
                      color="grey"
                      label="Cancelar"
                      @click="
                        modoSeleccion = false;
                        seleccionadas = [];
                      "
                    />
                    <q-btn
                      color="negative"
                      :label="`Borrar (${seleccionadas.length})`"
                      :disable="seleccionadas.length === 0"
                      :loading="cargandoOperacion"
                      @click="cancelarSeleccionadas"
                      dense
                      icon="delete"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <q-list
                bordered
                separator
                v-if="reservasConfirmadas.length > 0"
                class="rounded-borders"
              >
                <q-item v-for="reserva in reservasConfirmadas" :key="reserva.id" class="q-py-md">
                  <q-item-section avatar v-if="modoSeleccion">
                    <q-checkbox
                      v-model="seleccionadas"
                      :val="reserva.id"
                      :disable="!puedeCancelar(reserva)"
                    >
                      <q-tooltip v-if="!puedeCancelar(reserva)" class="bg-negative">
                        Menos de 24h
                      </q-tooltip>
                    </q-checkbox>
                  </q-item-section>

                  <q-item-section avatar v-else>
                    <q-avatar
                      :color="reserva.tipo === 'conversacion' ? 'purple-1' : 'blue-1'"
                      :text-color="reserva.tipo === 'conversacion' ? 'purple-8' : 'blue-8'"
                      icon="videocam"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-h6">
                      {{ formatFecha(reserva.fecha) }}
                    </q-item-label>
                    <q-item-label class="text-subtitle1 text-primary q-mb-xs">
                      A las {{ reserva.hora.slice(0, 5) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ getTipoClaseTexto(reserva) }}
                    </q-item-label>

                    <q-item-label
                      caption
                      v-if="!puedeCancelar(reserva)"
                      class="text-negative q-mt-xs text-weight-bold"
                    >
                      <q-icon name="lock" size="xs" />
                      {{ t('personal.noSePuedeCancelar') || 'Menos de 24h' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side v-if="!modoSeleccion">
                    <q-btn
                      v-if="reserva.meet_link"
                      type="a"
                      :href="reserva.meet_link"
                      target="_blank"
                      color="primary"
                      icon="video_camera_front"
                      label="ENTRAR"
                      class="text-weight-bold q-px-md"
                      unelevated
                    />
                    <q-badge v-else color="grey-3" text-color="grey-8" label="Pendiente" />
                  </q-item-section>
                </q-item>
              </q-list>

              <p v-else class="text-grey q-pa-md text-center">
                <q-icon name="event_busy" size="md" /> <br />
                {{ t('personal.noTienesReservas') }}
              </p>
            </q-card-section>
          </q-card>
        </div>

        <div v-if="menuActivo === 'cursos'">
          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">{{ t('personal.misSuscripcionesActivas') }}</div>
                <q-btn flat icon="refresh" round color="primary" @click="cargarSuscripciones" />
              </div>
            </q-card-section>

            <q-card-section>
              <q-list bordered separator v-if="misSuscripciones.length > 0" class="rounded-borders">
                <q-item v-for="sub in misSuscripciones" :key="sub.id" class="q-py-md">
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
                      {{ traducirDiasSemana(sub.cursos_grupales.dias_semana) }} a las
                      {{ formatHorarios(sub.cursos_grupales.horarios_curso) }}
                    </q-item-label>
                    <q-item-label caption>
                      <q-badge v-if="sub.cancel_at_period_end" color="orange">{{
                        t('personal.cancelacionProgramada')
                      }}</q-badge>
                      <q-badge v-else :color="sub.estado === 'active' ? 'positive' : 'grey'">{{
                        sub.estado === 'active' ? 'Activa' : sub.estado
                      }}</q-badge>
                    </q-item-label>
                    <q-item-label caption class="text-grey-8 q-mt-xs">
                      {{
                        sub.cancel_at_period_end
                          ? t('personal.accesoValidoHasta')
                          : t('personal.proximaRenovacion')
                      }}:
                      <strong>{{ formatearFechaSuscripcion(sub.current_period_end) }}</strong>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="column q-gutter-sm items-end">
                      <q-btn
                        v-if="sub.cursos_grupales?.meet_link"
                        type="a"
                        :href="sub.cursos_grupales.meet_link"
                        target="_blank"
                        color="primary"
                        icon="video_camera_front"
                        label="ENTRAR"
                        class="text-weight-bold q-px-md"
                        unelevated
                      />
                      <q-badge v-else color="grey-3" text-color="grey-8" label="Pendiente" />

                      <q-btn
                        v-if="!sub.cancel_at_period_end && sub.estado === 'active'"
                        outline
                        color="negative"
                        :label="t('personal.cancelar')"
                        class="q-px-md"
                        @click="confirmarCancelacion(sub)"
                        :loading="procesando"
                      />

                      <q-btn
                        v-if="sub.cancel_at_period_end && sub.estado === 'active'"
                        outline
                        color="positive"
                        label="Reactivar"
                        class="q-px-md"
                        @click="reactivarSuscripcion(sub)"
                        :loading="procesando"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center text-grey q-pa-lg border-dashed">
                <q-icon name="school" size="50px" color="grey-4" />
                <p class="q-mt-sm">{{ t('personal.noTienesSuscripciones') }}</p>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-card v-if="menuActivo === 'datos'">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('personal.datosPersonales') }}</div>
            <q-form @submit="enviarDatosPersonales" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formDatos.nombre"
                    :label="t('personal.nombre') + ' *'"
                    outlined
                    :rules="[(val) => !!val || t('personal.elnombreEs')]"
                  />
                  <q-input
                    v-model="formDatos.apellido1"
                    :label="t('personal.primerApellido')"
                    outlined
                  />
                  <q-input
                    v-model="formDatos.apellido2"
                    :label="t('personal.segundoApellido')"
                    outlined
                  />
                  <q-input
                    v-model="formDatos.direccion"
                    :label="t('personal.direccion')"
                    outlined
                  />
                  <q-input
                    v-model="formDatos.codigoPostal"
                    :label="t('personal.codigoPostal')"
                    outlined
                    mask="#####"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="formDatos.ciudad" :label="t('personal.ciudad')" outlined />
                  <q-select
                    v-model="formDatos.pais"
                    :options="paises"
                    :label="t('personal.pais')"
                    outlined
                  />
                  <q-input
                    v-model="formDatos.nif"
                    :label="t('personal.nif')"
                    outlined
                    mask="XXXXXXXXX"
                  />
                  <q-input
                    v-model="formDatos.email"
                    :label="t('personal.email') + ' *'"
                    type="email"
                    outlined
                    :rules="[
                      (val) => (!!val && /.+@.+\..+/.test(val)) || t('personal.emailDebeSerValido'),
                    ]"
                  />
                  <q-input
                    v-model="formDatos.telefono"
                    :label="t('personal.telefono')"
                    outlined
                    mask="### ### ###"
                  />
                </div>
              </div>
              <q-input
                v-model="formDatos.observaciones"
                :label="t('personal.observaciones')"
                outlined
                type="textarea"
                rows="3"
              />
              <div class="row q-gutter-md q-mt-lg">
                <q-btn
                  :label="t('personal.validarDatos')"
                  color="info"
                  @click="validarDatos"
                  icon="check_circle"
                />
                <q-btn
                  :label="t('personal.guardarCambios')"
                  type="submit"
                  color="primary"
                  icon="save"
                />
                <q-btn
                  :label="t('personal.limpiar')"
                  color="grey"
                  @click="limpiarFormulario"
                  icon="clear"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <q-card v-if="menuActivo === 'historial'">
          <q-card-section
            ><div class="text-h6">{{ t('personal.tuHistorialDeClases') }}</div></q-card-section
          >
          <q-card-section>
            <q-list bordered v-if="reservasPasadas.length > 0">
              <q-item v-for="reserva in reservasPasadas" :key="reserva.id" class="q-mb-sm">
                <q-item-section>
                  <q-item-label class="text-weight-bold"
                    >{{ formatFecha(reserva.fecha) }} a las
                    {{ reserva.hora.slice(0, 5) }}</q-item-label
                  >
                  <q-item-label caption>{{ getTipoClaseTexto(reserva) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <p v-else class="text-grey">{{ t('personal.noTienesClases') }}</p>
          </q-card-section>
        </q-card>

        <q-card v-if="menuActivo === 'eliminar'">
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ t('personal.eliminarCuenta') }}</div>
            <q-form @submit="eliminarCuenta" class="q-gutter-md">
              <q-input
                v-model="passwordConfirm"
                type="password"
                :label="t('personal.confirmaTuContrasena')"
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
import { useSuscripciones } from 'src/composables/useSuscripciones';
import SaldoWallet from 'components/SaldoWallet.vue';

const $q = useQuasar();
const { user, logout } = useAuth();
const router = useRouter();
const { t, locale } = useI18n();
const { procesando, cambiarEstadoCancelacion } = useSuscripciones();

// --- ESTADOS ---
const reservasConfirmadas = ref<Reserva[]>([]);
const reservasPasadas = ref<Reserva[]>([]);
const menuVisible = ref($q.screen.gt.sm);
const menuActivo = ref('reservadas');
const passwordConfirm = ref('');
const deleting = ref(false);
const cargandoSaldo = ref(true);
const sessionToken = ref<string | null>(null);

// Múltiple selección
const modoSeleccion = ref(false);
const seleccionadas = ref<string[]>([]);
const cargandoOperacion = ref(false); // Estado local de carga

// Interfaces
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
  meet_link?: string;
}

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
    meet_link?: string;
  };
}
const misSuscripciones = ref<Suscripcion[]>([]);

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
  saldo_normal: number;
  saldo_conversacion: number;
  [key: string]: string | number | null;
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
  saldo_normal: 0,
  saldo_conversacion: 0,
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

// --- FUNCIONES SELECCIÓN ---
const puedeCancelar = (reserva: Reserva): boolean => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  return (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60) >= 24;
};

// Cancelación Masiva (Corregido error de loading)
const cancelarSeleccionadas = () => {
  if (seleccionadas.value.length === 0) return;

  $q.dialog({
    title: t('personal.cancelarReserva') || 'Cancelar Clases',
    message: `Vas a cancelar ${seleccionadas.value.length} clase(s). <br>Se devolverán los créditos si faltan más de 24h.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Confirmar', color: 'negative' },
  }).onOk(() => {
    void (async () => {
      cargandoOperacion.value = true;
      try {
        const { data, error } = await supabase.functions.invoke('cancel-reserva', {
          body: { reservaIds: seleccionadas.value },
        });

        if (error) throw error;

        const mensaje = `Hecho: ${data.canceladas} canceladas.`;
        $q.notify({ type: data.canceladas > 0 ? 'positive' : 'warning', message: mensaje });

        seleccionadas.value = [];
        modoSeleccion.value = false;
        await Promise.all([cargarDatosPersonales(), cargarReservasConfirmadas()]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error desconocido';
        $q.notify({ type: 'negative', message: msg });
      } finally {
        cargandoOperacion.value = false;
      }
    })();
  });
};

// --- RESTO DE FUNCIONES ---
const cargarSuscripciones = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`*, cursos_grupales!course_id (nombre_curso, dias_semana, horarios_curso, meet_link)`)
    .eq('user_id', user.value?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }
  if (data) {
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
    title: `¿${t('personal.cancelarSuscripcion')}?`,
    message: `${t('personal.seguirasTeniendoAcceso')} <b>${fechaFin}</b>.`,
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
  return date.toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' });
};

const eliminarCuenta = async () => {
  if (!user.value?.email || !user.value?.id) return;
  if (!passwordConfirm.value) return;
  deleting.value = true;
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: passwordConfirm.value,
    });
    if (signInError) throw new Error(t('personal.contrasenaIncorrecta'));
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('personal.cuentaEliminada') });
    await logout();
    await router.push('/');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    deleting.value = false;
  }
};

const cargarDatosPersonales = async () => {
  if (!user.value?.id) return;
  cargandoSaldo.value = true;
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
        saldo_normal: data.saldo_normal || 0,
        saldo_conversacion: data.saldo_conversacion || 0,
      };
    } else {
      formDatos.value.email = user.value.email || '';
    }
  } catch (error) {
    console.error(error);
  } finally {
    cargandoSaldo.value = false;
  }
};

const esAdmin = computed(() => {
  if (!sessionToken.value) return false;
  try {
    const payload = jwtDecode<{ app_metadata?: { is_admin?: boolean } }>(sessionToken.value);
    return Boolean(payload.app_metadata?.is_admin);
  } catch {
    return false;
  }
});

const cargarSesion = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  sessionToken.value = session?.access_token || null;
};

const cargarReservasPasadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data: antiguas } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .lt('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: false });

    const { data: hoy } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .eq('fecha', new Date().toISOString().split('T')[0]);

    let pasadasHoy: Reserva[] = [];
    if (hoy) {
      const ahora = new Date();
      pasadasHoy = hoy.filter((r) => {
        const fechaClase = new Date(`${r.fecha}T${r.hora}`);
        return fechaClase <= ahora;
      });
    }
    const total = [...(antiguas || []), ...pasadasHoy];
    reservasPasadas.value = total.sort((a, b) => {
      return (
        new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime()
      );
    });
  } catch (error) {
    console.error(error);
  }
};

const cargarReservasConfirmadas = async () => {
  if (!user.value?.id) return;
  try {
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0]) // >= Hoy
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (data) {
      const ahora = new Date();
      reservasConfirmadas.value = data.filter((r) => {
        const fechaClase = new Date(`${r.fecha}T${r.hora}`);
        return fechaClase > ahora; // Solo si es en el futuro
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const irAPanelAdmin = async () => {
  await router.push('/Administracion');
};

const validarDatos = () => {
  if (!formDatos.value.nombre || !formDatos.value.email)
    $q.notify({ type: 'warning', message: t('personal.faltanCamposObligatorios') });
  else $q.notify({ type: 'positive', message: t('personal.datosValidos') });
};

const enviarDatosPersonales = async () => {
  try {
    const datos = {
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
      .upsert([datos], { onConflict: 'email' });
    if (error) throw error;

    $q.notify({
      type: 'positive',
      message: t('personal.datosGuardadosCorrectamente'),
      timeout: 3000,
    });
  } catch (error) {
    console.error('Error al guardar:', error);
    $q.notify({ type: 'negative', message: t('personal.errorGuardandoDatos'), timeout: 3000 });
  }
};

const limpiarFormulario = () => {
  Object.keys(formDatos.value).forEach((key) => {
    formDatos.value[key] = '';
  });
  formDatos.value.pais = null;
};

const seleccionarMenu = (menu: string) => {
  menuActivo.value = menu;
  if (menu === 'historial') void cargarReservasPasadas();
  else if (menu === 'datos') void cargarDatosPersonales();
  else if (menu === 'cursos') void cargarSuscripciones();
  if ($q.screen.lt.md) menuVisible.value = false;
};

const diasSemanaMap: Record<string, Record<string, string>> = {
  lunes: { 'es-ES': 'lunes', 'en-US': 'Monday' },
  martes: { 'es-ES': 'martes', 'en-US': 'Tuesday' },
  miercoles: { 'es-ES': 'miércoles', 'en-US': 'Wednesday' },
  jueves: { 'es-ES': 'jueves', 'en-US': 'Thursday' },
  viernes: { 'es-ES': 'viernes', 'en-US': 'Friday' },
  sabado: { 'es-ES': 'sábado', 'en-US': 'Saturday' },
  domingo: { 'es-ES': 'domingo', 'en-US': 'Sunday' },
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const traducirDiasSemana = (dias?: string[]) => {
  if (!dias || dias.length === 0) return '';
  return dias
    .map((dia) => {
      const key = dia.toLowerCase();
      const traducciones = diasSemanaMap[key] || diasSemanaMap[dia];
      return traducciones?.[locale.value] ?? traducciones?.['es-ES'] ?? dia;
    })
    .join(', ');
};

const formatHorarios = (horarios?: string[]) => {
  if (!horarios || horarios.length === 0) return '';
  return horarios
    .map((hora) => {
      const parts = hora.split(':');
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (Number.isFinite(h) && Number.isFinite(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' });
      }
      return hora;
    })
    .join(', ');
};

const getTipoClaseTexto = (reserva: Reserva): string =>
  reserva.tipo === 'normal' ? t('personal.claseNormal') : t('personal.claseConversacion');

onMounted(() => {
  void cargarReservasConfirmadas();
  void cargarSesion();
  void cargarDatosPersonales();
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
  background-color: #fce4ec;
  color: #851319;
  border-right: 3px solid #851319;
}
</style>
