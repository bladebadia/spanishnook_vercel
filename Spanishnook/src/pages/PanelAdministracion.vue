<template>
  <q-page class="q-pa-lg">
    <!-- Header saludo OK  -->
    <div class="row items-center flex flex-center q-pa-lg q-mb-md">
        <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
          PANEL DE ADMINISTRACION
        </p>
    </div>

    <!-- Contenedor principal con menú lateral y contenido -->
    <div class="row  flex">
      <!-- Menú lateral -->
      <div :class="[$q.screen.lt.md ? 'col-12' : 'col-3']">
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
        <q-card v-show="menuVisible || $q.screen.gt.sm" class=" q-mb-md">
          <q-list bordered>
            <!-- Sección principal -->
            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'Calendario' || menuActivo === ''"
              @click="seleccionarMenu('Calendario')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="event" color="primary" />
              </q-item-section>
              <q-item-section>Calendario</q-item-section>
            </q-item>

            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'Precios y ofertas'"
              @click="seleccionarMenu('Precios y ofertas')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="history" color="primary" />
              </q-item-section>
              <q-item-section>Precios y ofertas</q-item-section>
            </q-item>

            <!-- Sección personal -->
            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'Cursos'"
              @click="seleccionarMenu('Cursos')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Cursos</q-item-section>
            </q-item>

            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'tarjetas y noticias'"
              @click="seleccionarMenu('tarjetas y noticias')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" color="red" />
              </q-item-section>
              <q-item-section>
                Tarjetas y Noticias
              </q-item-section>
            </q-item>

            <q-item
              v-if="esAdmin"
              clickable
              v-ripple
              :active="menuActivo === 'FAKs'"
              @click="seleccionarMenu('FAKs')"
              active-class="menu-activo"
            >
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>FAKs</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Contenido principal -->
      <div v-if="menuActivo === 'Calendario' || menuActivo === ''" 
        class="q-col-12 q-col-md-5" >
        <q-date
          v-model="fechasSeleccionadas"
          multiple
          landscape
          class="shadow-1 rounded-borders "
          today-btn
          mask="YYYY-MM-DD"
          color="primary"
          text-color="white"
          @update:model-value="onFechasSeleccionadas"                  
        />
        <div class="q-mt-md">
          <q-btn
            label="Leer datos"
            color="primary"
            class="q-mr-sm"
            @click="leerDatos"
          />
          <q-btn
            label="Grabar selección"
            color="secondary"
            @click="grabarSeleccion"
          />
        </div>
      </div>   

        <div class="q-col-12 q-col-md-4" v-if="fechasSeleccionadas.length > 0">
          <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ fechasSeleccionadas.length === 1 ? 'Detalles de la Fecha' : 'Detalles del Intervalo' }}
            </div>
          </q-card-section>
          <q-card-section>
            <q-form>
              <q-select
                v-model="formularioFecha.tipoDia"
                :options="['Laborable', 'Festivo', 'Especial']"
                label="Tipo de día"
                outlined
                class="full-width"
              />
              <q-input
                v-model="formularioFecha.estado"
                label="Estado"
                outlined
                class="full-width"
              />
              <q-input
                v-model="formularioFecha.fecha"
                label="Fecha"
                outlined
                readonly
                class="full-width"
              />
              <!-- Campo horario solo para selección individual -->
              <q-input
                v-if="fechasSeleccionadas.length === 1"
                v-model="formularioFecha.horario"
                label="Horario"
                outlined
                class="full-width"
              />
            </q-form>
          </q-card-section>
        </q-card>
        </div>

        <q-card v-if="menuActivo === 'datos'">
          
        </q-card>

        
        <q-card v-if="menuActivo === 'historial'">
        </q-card>

        <q-card v-if="menuActivo === 'mensajes'">
         
        </q-card>

        <q-card v-if="menuActivo === 'configuracion'">
          
        </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useQuasar } from 'quasar';
import '../css/pages/EstilosGenerales.css';
//import { useI18n } from 'vue-i18n';
//import { useReservasClases } from 'src/composables/useReservasClases';


const $q = useQuasar();
const { user } = useAuth();
const menuVisible = ref($q.screen.gt.sm);
const menuActivo = ref('Calendario');

// Computed para verificar si el usuario es administrador
const esAdmin = computed(() => {
  return (user.value?.user_metadata?.role ?? '')=== 'admin'; // Cambia 'role' según la estructura de tu usuario
});

// Usar el composable para manejar la lógica de reservas
const  fechasSeleccionadas = ref<string[]>([]);
 
// Formulario dinámico
const formularioFecha = ref({
  tipoDia: '',
  estado: '',
  fecha: '',
  horario: '', // Solo para selección individual
});

// Función para manejar la selección múltiple de fechas
const onFechasSeleccionadas = (fechas: string[]) => {
  console.log('Fechas seleccionadas:', fechas);

  if (fechas.length === 0) {
    formularioFecha.value.tipoDia = 'Laborable';
    formularioFecha.value.estado = '';
    formularioFecha.value.fecha = '';
    formularioFecha.value.horario = '';
    return;
  }

  if (fechas.length === 1) {
    // Selección individual
    formularioFecha.value.fecha = fechas[0];
    formularioFecha.value.horario = ''; // Ajusta el horario según sea necesario
  } else {
    // Selección múltiple
    formularioFecha.value.fecha = `${fechas[0]} - ${fechas[fechas.length - 1]}`;
    formularioFecha.value.horario = ''; // No aplica para selección múltiple
  }
};



const leerDatos = async () => {
  try {
    const { data, error } = await supabase
      .from('Calendario')
      .select('tipo_dia, horario, estado, fecha, fecha_text');

    if (error) {
      console.error('Error al leer datos:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al leer datos del calendario.',
      });
      return;
    }

    console.log('Datos leídos:', data);
    $q.notify({
      type: 'positive',
      message: 'Datos leídos correctamente.',
    });
  } catch (err) {
    console.error('Error al leer datos:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al leer datos del calendario.',
    });
  }
};


  // Función para grabar la selección en Supabase
const grabarSeleccion = async () => {
  try {
    const datosAGuardar = fechasSeleccionadas.value.map((fecha) => ({
      tipo_dia: 'Laborable', // Puedes ajustar este valor según sea necesario
      horario: {}, // Ajusta el horario según tu lógica
      estado: 'Habilitado', // Ajusta el estado según sea necesario
      fecha: fecha,
      fecha_text: fecha,
    }));

    const { error } = await supabase.from('Calendario').insert(datosAGuardar);

    if (error) {
      console.error('Error al grabar datos:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al grabar la selección.',
      });
      return;
    }

    console.log('Datos grabados:', datosAGuardar);
    $q.notify({
      type: 'positive',
      message: 'Selección grabada correctamente.',
    });
  } catch (err) {
    console.error('Error al grabar datos:', err);
    $q.notify({
      type: 'negative',
      message: 'Error al grabar la selección.',
    });
  }
};

// Función para seleccionar menú
const seleccionarMenu = (menu: string) => {
  menuActivo.value = menu;
};

</script>

<style>

</style>
