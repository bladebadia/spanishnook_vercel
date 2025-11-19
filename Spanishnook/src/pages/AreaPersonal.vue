
<template>
  <q-page class="q-pa-lg">
    <!-- Header con botones y saludo OK  -->
    <div class="row items-center q-pa-lg q-mb-md">
      <!-- Botón Nueva Reserva a la izquierda -->
      <div class="col-auto">
        <q-btn color="primary" label="Nueva Reserva" icon="add" to="/Reservas" size="md" />
      </div>

      <!-- Saludo en el centro -->
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

      <!-- Botón Cerrar Sesión a la derecha -->
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

    <!-- Contenedor principal con menú lateral y contenido -->
    <div class="row q-col-gutter-lg">
      <!-- Menú lateral -->
      <div :class="['menu-lateral', $q.screen.lt.md ? 'col-12' : 'col-3']">
        <!-- Botón de visibilidad (solo en móviles) -->
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

        <!-- Menú lateral -->
        <q-card v-show="menuVisible || $q.screen.gt.sm" class="menu-card q-mb-md">
          <q-list bordered class="rounded-borders">
            <!-- Sección principal -->
            <q-item-label header class="text-weight-bold text-primary"> Mis Clases </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'reservadas'"
              @click="seleccionarMenu('reservadas')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="event" color="primary" />
              </q-item-section>
              <q-item-section>Clases Reservadas</q-item-section>
              <q-item-section side>
                <q-badge v-if="reservasConfirmadas.length > 0" color="positive" rounded>
                  {{ reservasConfirmadas.length }}
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'historial'"
              @click="seleccionarMenu('historial')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="history" color="primary" />
              </q-item-section>
              <q-item-section>Historial de Clases</q-item-section>
            </q-item>

            <q-separator />

            <!-- Sección personal -->
            <q-item-label header class="text-weight-bold text-primary"> Mi Cuenta </q-item-label>

            <q-item
              clickable
              v-ripple
              :active="menuActivo === 'datos'"
              @click="seleccionarMenu('datos')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Datos Personales</q-item-section>
            </q-item>

            <!-- Panel de Administración (solo para admins) -->
            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'admin'"
              @click="irAPanelAdmin"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" color="red" />
              </q-item-section>
              <q-item-section>
                <span class="text-weight-bold text-red">Panel de Administración</span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Contenido principal -->
      <div :class="[$q.screen.lt.md ? 'col-12' : 'col-9']">
        <!-- Contenido dinámico según selección del menú -->
        <div v-if="menuActivo === 'reservadas' || menuActivo === ''">
          <!-- Reservas Confirmadas -->
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
            </q-card-section>
          </q-card>
        </div>

        <!-- Formulario de Datos Personales -->
        <q-card v-if="menuActivo === 'datos'">
          <q-card-section>
            <div class="text-h6 q-mb-md">Datos Personales</div>
              <q-form @submit="enviarDatosPersonales" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <!-- Columna izquierda -->
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

                    <q-input v-model="formDatos.codigoPostal" label="Código Postal" outlined mask="#####" />
                  </div>

                  <!-- Columna derecha -->
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

                    <q-input v-model="formDatos.telefono" label="Teléfono" outlined mask="### ### ###" />
                  </div>
                </div>

                <!-- Campos adicionales -->
                <q-input
                  v-model="formDatos.observaciones"
                  label="Observaciones"
                  outlined
                  type="textarea"
                  rows="3"
                />

                <!-- Botones de acción -->
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

        <!-- Otros contenidos según selección del menú -->
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

        <q-card v-if="menuActivo === 'mensajes'">
          <q-card-section>
            <div class="text-h6">Mensajes</div>
            <p class="text-grey">Aquí aparecerán los mensajes de tus clases.</p>
          </q-card-section>
        </q-card>

        <q-card v-if="menuActivo === 'configuracion'">
          <q-card-section>
            <div class="text-h6">Configuración</div>
            <p class="text-grey">Aquí podrás configurar tus preferencias.</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
const { t } = useI18n();
const menuVisible = ref($q.screen.gt.sm);
const menuActivo = ref('reservadas');


const cargarDatosPersonales = async () => {
  if (!user.value?.id) {
    $q.notify({
      type: 'warning',
      message: 'No se pudo cargar la información del usuario. ID no encontrado.',
      timeout: 3000,
    });
    return;
  }

  try {
    // Verificar si el usuario ya tiene un registro en la tabla `datos_usuarios`
    const { data, error } = await supabase
      .from('datos_usuarios')
      .select('*')
      .eq('user_id', user.value.id)
      .single(); // Obtener un único registro

    if (error && error.code !== 'PGRST116') {
      // Error distinto a "no se encontró registro"
      console.error('Error cargando datos personales:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar los datos personales.',
        timeout: 3000,
      });
      return;
    }

    if (data) {
      // Si el registro ya existe, validar el correo
      if (data.email !== user.value.email) {
        $q.notify({
          type: 'negative',
          message: 'El correo electrónico no coincide con el registro existente.',
          timeout: 3000,
        });
        return;
      }

      // Sobrescribir los datos en el formulario
      formDatos.value = {
        nombre: data.nombre || '',
        apellido1: data.apellido1 || '',
        apellido2: data.apellido2 || '',
        direccion: data.direccion || '',
        codigo_postal: data.codigo_postal || '',
        ciudad: data.ciudad || '',
        pais: data.pais || null,
        nif: data.nif || '',
        email: data.email || '',
        telefono: data.telefono || '',
        observaciones: data.observaciones || '',
      };

      $q.notify({
        type: 'positive',
        message: 'Datos personales cargados correctamente.',
        timeout: 3000,
      });
    } else {
      // Si no existe, crear un nuevo registro
      const nuevoRegistro = {
        user_id: user.value.id,
        nombre: '',
        apellido1: '',
        apellido2: '',
        direccion: '',
        codigo_postal: '',
        ciudad: '',
        pais: null,
        nif: '',
        email: user.value.email || '',
        telefono: '',
        observaciones: '',
      };

      const { error: insertError } = await supabase
        .from('datos_usuarios')
        .insert([nuevoRegistro]);

      if (insertError) {
        console.error('Error creando nuevo registro:', insertError);
        $q.notify({
          type: 'negative',
          message: 'Error al crear el registro de datos personales.',
          timeout: 3000,
        });
        return;
      }

      formDatos.value = nuevoRegistro;

      $q.notify({
        type: 'positive',
        message: 'Nuevo registro creado correctamente.',
        timeout: 3000,
      });
    }
  } catch (error) {
    console.error('Error cargando datos personales:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos personales.',
      timeout: 3000,
    });
  }
};

// Computed para verificar si es admin
const esAdmin = computed(() => {
  return user.value?.user_metadata?.role === 'admin';
});

const reservasPasadas = ref<Reserva[]>([]);


const cargarReservasPasadas = async () => {
  if (!user.value?.id) {
    reservasPasadas.value = [];
    return;
  }

  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('estado', 'confirmada')
      .lt('fecha', new Date().toISOString().split('T')[0]) // Reservas anteriores a hoy
      .order('fecha', { ascending: false }) // Ordenar por fecha descendente
      .order('hora', { ascending: false });
      console.log('Reservas pasadas cargadas:', data);

    if (error) {
      console.error('Error cargando reservas pasadas:', error);
      return;
    }

    reservasPasadas.value = data || [];
  } catch (error) {
    console.error('Error cargando reservas pasadas:', error);
    reservasPasadas.value = [];
  }
};

// Formulario de datos personales
const formDatos = ref<{
  [key: string]: string | null; // Firma de índice
  nombre: string;
  apellido1: string;
  apellido2: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  pais: string | null;
  nif: string;
  email: string;
  telefono: string;
  observaciones: string;
}>({
  nombre: '',
  apellido1: '',
  apellido2: '',
  direccion: '',
  codigo_postal: '',
  ciudad: '',
  pais: null,
  nif: '',
  email: '',
  telefono: '',
  observaciones: '',
});

// Lista de países
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

// Función para ir al panel de administración
const irAPanelAdmin = async () => {
  await router.push('/Administracion');
};

// Función para validar datos
const validarDatos = () => {
  const camposRequeridos = ['nombre', 'email'];

  const camposFaltantes = camposRequeridos.filter((campo) => !formDatos.value[campo]);

  if (camposFaltantes.length > 0) {
    $q.notify({
      type: 'warning',
      message: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}`,
      timeout: 5000,
    });
  } else {
    $q.notify({
      type: 'positive',
      message: 'Todos los datos son válidos',
      timeout: 3000,
    });
  }
};


// Función para enviar datos personales
const enviarDatosPersonales = async () => {
  try {
    // Filtrar solo los campos necesarios para enviar a Supabase
    const datosAEnviar = {
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

    // Enviar los datos a la tabla `datos_usuarios`
    const { data, error } = await supabase
      .from('datos_usuarios')
      .upsert([datosAEnviar], { onConflict: 'email' }); // Actualiza si el correo ya existe

    if (error) {
      throw error;
    }
      console.log('Datos guardados:', data);
    $q.notify({
      type: 'positive',
      message: 'Datos guardados correctamente',
      timeout: 3000,
    });
  } catch (error) {
    console.error('Error guardando datos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar los datos',
      timeout: 3000,
    });
  }
};

// Función para limpiar formulario
const limpiarFormulario = () => {
  Object.keys(formDatos.value).forEach((key) => {
    formDatos.value[key] = '';
  });
  formDatos.value.pais = null;
  formDatos.value.genero = null;
};

// Función para seleccionar menú
const seleccionarMenu = (menu: string) => {
  menuActivo.value = menu;

  if (menu === 'historial') {
    void cargarReservasPasadas();
  }else if (menu === 'datos') {
    void cargarDatosPersonales();
  }

  if ($q.screen.lt.md) {
    menuVisible.value = false;
  }
};

// Resto del código existente (interfaces y funciones)...
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

const getTipoClaseTexto = (reserva: Reserva): string => {
  if (reserva.tipo) {
    return reserva.tipo === 'normal' ? 'Clase Normal' : 'Clase Conversación';
  }
  return 'Clase Normal';
};

const getPrecioClase = (reserva: Reserva): number => {
  if (reserva.tipo) {
    return reserva.tipo === 'normal' ? 32 : 20;
  }
  return 25;
};

const puedeCancelar = (reserva: Reserva): boolean => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  return diferenciaHoras >= 72;
};

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
  } catch (error) {
    console.error('Error cargando reservas:', error);
    reservasConfirmadas.value = [];
  }
};

const cancelarReserva = (reserva: Reserva) => {
  const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
  const ahora = new Date();
  const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

  if (diferenciaHoras < 72) {
    const horasRestantes = Math.max(0, Math.floor(diferenciaHoras));
    $q.notify({
      type: 'negative',
      message: `No puedes cancelar con menos de 72 horas de antelación`,
      caption: `Tiempo restante: ${horasRestantes} horas`,
      timeout: 6000,
    });
    return;
  }

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

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        reservasConfirmadas.value = reservasConfirmadas.value.filter((r) => r.id !== reserva.id);

        $q.notify({
          type: 'positive',
          message: data?.message || 'Reserva cancelada y reembolso realizado con éxito',
          timeout: 5000,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cancelar la reserva';
        $q.notify({
          type: 'negative',
          message: errorMessage,
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
