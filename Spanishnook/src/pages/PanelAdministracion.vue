<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center flex flex-center q-pa-lg q-mb-md">
      <p v-if="user?.user_metadata?.nombre" class="subtitulo-responsivo">
        PANEL DE ADMINISTRACIÓN - {{ seccionActual.toUpperCase() }}
      </p>
    </div>

    <!-- Menú lateral y contenido -->
    <div class="row q-col-gutter-lg">
      <!-- Menú lateral izquierdo -->
      <div class="col-12 col-md-3">
        <q-card class="sticky-menu">
          <q-list padding class="menu-lateral">
            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'calendario'"
              @click="cambiarSeccion('calendario')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="event" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Calendario</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'precios'"
              @click="cambiarSeccion('precios')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="attach_money" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Precios y Ofertas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'cursos'"
              @click="cambiarSeccion('cursos')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="school" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cursos </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :active="seccionActual === 'noticias'"
              @click="cambiarSeccion('noticias')"
              class="menu-item"
            >
              <q-item-section avatar>
                <q-icon name="article" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tarjetas y Noticias</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Contenido principal -->
      <div class="col-12 col-md-9">
        <!-- Sección Calendario -->
        <div v-if="seccionActual === 'calendario'">
          <!-- Controles principales -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-8">
              <q-btn-group>
                <q-btn
                  :color="seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionMultiple"
                  label="Selección múltiple"
                  icon="checklist"
                />
                <q-btn
                  :color="!seleccionMultiple ? 'primary' : 'grey'"
                  @click="activarSeleccionUnica"
                  label="Selección única"
                  icon="event"
                />
                <q-btn
                  color="positive"
                  icon="save"
                  label="Guardar cambios"
                  @click="grabarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                  :loading="guardando"
                />
                <q-btn
                  color="negative"
                  icon="delete"
                  label="Eliminar selección"
                  @click="eliminarSeleccion"
                  :disabled="fechasSeleccionadas.length === 0"
                />
              </q-btn-group>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="mesActual"
                type="text"
                label="Mes y año"
                @update:model-value="cambiarMes"
                filled
                :min="'2024-01'"
                :max="'2030-12'"
                mask="####-##"
                placeholder="YYYY-MM"
              />
            </div>
          </div>

          <!-- Leyenda -->
          <q-card class="q-mb-md">
            <q-card-section class="q-py-sm">
              <div class="row items-center q-gutter-md">
                <div class="text-caption text-weight-bold">Leyenda:</div>
                <div class="row items-center">
                  <q-icon name="square" color="blue" size="sm" />
                  <span class="q-ml-xs text-caption">Laborable</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="red" size="sm" />
                  <span class="q-ml-xs text-caption">Festivo</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="orange" size="sm" />
                  <span class="q-ml-xs text-caption">Especial</span>
                </div>
                <div class="row items-center">
                  <q-icon name="square" color="green" size="sm" />
                  <span class="q-ml-xs text-caption">Seleccionado</span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Calendario personalizado -->
          <q-card>
            <q-card-section>
              <!-- Encabezado del calendario -->
              <div class="row items-center justify-between q-mb-md">
                <div class="col-auto">
                  <q-btn icon="chevron_left" flat round @click="mesAnterior" color="primary" />
                </div>
                <div class="col text-center">
                  <div class="text-h6 text-weight-bold">{{ nombreMesActual }} {{ añoActual }}</div>
                </div>
                <div class="col-auto">
                  <q-btn icon="chevron_right" flat round @click="mesSiguiente" color="primary" />
                </div>
              </div>

              <!-- Días de la semana -->
              <div class="row q-mb-sm">
                <div
                  v-for="dia in diasSemana"
                  :key="dia"
                  class="col text-center text-weight-bold text-grey-7"
                >
                  {{ dia }}
                </div>
              </div>

              <!-- Días del mes -->
              <div class="calendario-grid">
                <div
                  v-for="(celda, index) in diasDelMes"
                  :key="index"
                  class="celda-dia"
                  :class="getClasesDia(celda)"
                  @click="seleccionarDia(celda)"
                >
                  <div v-if="celda" class="contenido-dia">
                    <div class="numero-dia">{{ celda.getDate() }}</div>
                    <div class="indicador-tipo" :class="getClaseTipoDia(celda)"></div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Panel de configuración -->
          <q-card v-if="fechasSeleccionadas.length > 0" class="q-mt-md">
            <q-card-section>
              <div class="text-h6">
                Configurar {{ fechasSeleccionadas.length }} día(s) seleccionado(s)
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Fechas seleccionadas:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="fecha in fechasSeleccionadas"
                    :key="fecha"
                    color="primary"
                    text-color="white"
                    removable
                    @remove="removerFecha(fecha)"
                  >
                    {{ formatFechaDisplay(fecha) }}
                  </q-chip>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Formulario de configuración -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.tipoDia"
                    :options="opcionesTipoDia"
                    label="Tipo de día *"
                    filled
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Campo obligatorio']"
                  />
                </div>

                <!-- SELECTOR DE HORARIOS MÚLTIPLE -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.horariosSeleccionados"
                    :options="todosLosHorarios"
                    label="Horarios"
                    filled
                    multiple
                    use-chips
                    stack-label
                    clearable
                    placeholder="Selecciona horarios"
                  />
                </div>

                <div class="col-12 col-md-4">
                  <q-select
                    v-model="configuracion.estado"
                    :options="['Habilitado', 'Deshabilitado', 'Pendiente']"
                    label="Estado"
                    filled
                  />
                </div>
              </div>

              <!-- Vista previa de horarios seleccionados -->
              <div v-if="configuracion.horariosSeleccionados.length > 0" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Horarios seleccionados:</div>
                <div class="q-gutter-sm">
                  <q-chip
                    v-for="horario in configuracion.horariosSeleccionados"
                    :key="horario"
                    color="secondary"
                    text-color="white"
                    removable
                    @remove="removerHorario(horario)"
                  >
                    {{ horario }}
                  </q-chip>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="row q-gutter-sm q-mt-lg">
                <q-btn
                  label="Aplicar configuración"
                  color="primary"
                  @click="aplicarConfiguracion"
                  class="col"
                  :disabled="!configuracion.tipoDia"
                />
                <q-btn
                  label="Limpiar selección"
                  color="grey"
                  @click="limpiarSeleccion"
                  class="col"
                  outline
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Precios y Ofertas -->
        <div v-if="seccionActual === 'precios'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Precios y Ofertas</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar los precios y ofertas del
                sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Cursos y Tarjetas -->
        <div v-if="seccionActual === 'cursos'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Cursos y Tarjetas</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar los cursos y tarjetas del
                sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sección Noticias -->
        <div v-if="seccionActual === 'noticias'">
          <q-card>
            <q-card-section>
              <div class="text-h4 q-mb-md">Noticias</div>
              <div class="text-body1">
                Esta sección está en desarrollo. Aquí podrás gestionar las noticias del sistema.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Interfaces
interface EntradaCalendario {
  id?: number;
  tipo_dia: string;
  horario: string | null;
  estado: string;
  fecha: string;
  fecha_text: string;
  created_at?: string;
  updated_at?: string;
}

interface Configuracion {
  tipoDia: string;
  estado: string;
  horariosSeleccionados: string[];
}

interface OpcionTipoDia {
  label: string;
  value: string;
}

const $q = useQuasar();

// Estado de la aplicación
const seccionActual = ref<string>('calendario');
const user = ref<User | null>(null);
const seleccionMultiple = ref<boolean>(true);
const guardando = ref<boolean>(false);
const mesActual = ref<string>(new Date().toISOString().slice(0, 7));
const fechasSeleccionadas = ref<string[]>([]);
const datosCalendario = ref<EntradaCalendario[]>([]);

// Configuración
const configuracion = ref<Configuracion>({
  tipoDia: '',
  estado: 'Habilitado',
  horariosSeleccionados: [],
});

// Opciones
const opcionesTipoDia: OpcionTipoDia[] = [
  { label: 'Laborable', value: 'laborable' },
  { label: 'Festivo', value: 'festivo' },
  { label: 'Especial', value: 'especial' },
];

// Horarios predefinidos
const todosLosHorarios = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

// Constantes
const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Computed
const fechaActual = computed(() => new Date(mesActual.value + '-01'));
const nombreMesActual = computed(() => {
  return fechaActual.value.toLocaleDateString('es-ES', { month: 'long' });
});
const añoActual = computed(() => fechaActual.value.getFullYear());

const diasDelMes = computed(() => {
  const year = fechaActual.value.getFullYear();
  const month = fechaActual.value.getMonth();

  const primerDia = new Date(year, month, 1);
  const ultimoDia = new Date(year, month + 1, 0);

  const diasMesAnterior = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

  const dias: (Date | null)[] = [];

  for (let i = 0; i < diasMesAnterior; i++) {
    dias.push(null);
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    dias.push(new Date(year, month, dia));
  }

  return dias;
});

// Navegación entre secciones
const cambiarSeccion = (seccion: string): void => {
  seccionActual.value = seccion;
};

// Funciones del calendario
const mesAnterior = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() - 1);

  const minDate = new Date(2024, 0, 1);
  if (fecha >= minDate) {
    mesActual.value = fecha.toISOString().slice(0, 7);
  }
};

// ...existing code...

const mesSiguiente = (): void => {
  const fecha = new Date(mesActual.value + '-01');
  fecha.setMonth(fecha.getMonth() + 1);
  
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1; // getMonth() es 0-indexed, sumamos 1
  
  // Formatear como YYYY-MM
  const mesStr = `${year}-${month.toString().padStart(2, '0')}`;
  
  console.log('Intentando avanzar a:', mesStr);
  console.log('Comparación:', mesStr, '<=', '2030-12', '=', mesStr <= '2030-12');
  
  // Permitir hasta 2030-12
  if (mesStr <= '2030-12') {
    mesActual.value = mesStr;
    console.log('Mes actualizado a:', mesActual.value);
  } else {
    console.log('Límite alcanzado, no se puede avanzar más');
    $q.notify({
      type: 'warning',
      message: 'Has alcanzado el límite máximo (Diciembre 2030)',
      timeout: 2000
    });
  }
};


// Selección de días
const seleccionarDia = (fecha: Date | null): void => {
  if (!fecha) return;

  const fechaStr = fecha.toISOString().split('T')[0];
  if (!fechaStr) return;

  if (seleccionMultiple.value) {
    const index = fechasSeleccionadas.value.indexOf(fechaStr);
    if (index > -1) {
      fechasSeleccionadas.value.splice(index, 1);
    } else {
      fechasSeleccionadas.value.push(fechaStr);
    }
  } else {
    fechasSeleccionadas.value = [fechaStr];
  }

  // ⬇️ NUEVO: Cargar configuración automáticamente al seleccionar
  cargarConfiguracionAutomatica();
};

// ⬇️ NUEVA FUNCIÓN: Cargar configuración automática
const cargarConfiguracionAutomatica = (): void => {
  if (fechasSeleccionadas.value.length === 0) {
    limpiarSeleccion();
    return;
  }

  // Si hay una sola fecha seleccionada
  if (fechasSeleccionadas.value.length === 1) {
    const fechaStr = fechasSeleccionadas.value[0];
    if (!fechaStr) return;

    // Buscar si ya existe configuración para esta fecha
    const entradaExistente = datosCalendario.value.find((item) => item.fecha === fechaStr);

    if (entradaExistente) {
      // Cargar configuración existente
      configuracion.value.tipoDia = entradaExistente.tipo_dia;
      configuracion.value.estado = entradaExistente.estado;

      // Parsear horarios desde string a array
      if (entradaExistente.horario) {
        try {
          // Si horario es string como "{09:00,10:00}", convertir a array
          if (typeof entradaExistente.horario === 'string') {
            const horariosStr = entradaExistente.horario.replace(/[{}]/g, '');
            configuracion.value.horariosSeleccionados = horariosStr
              .split(',')
              .map((h) => h.trim().replace(/"/g, ''))
              .filter((h) => h.length > 0);
          } else {
            configuracion.value.horariosSeleccionados = [];
          }
        } catch (error) {
          console.error('Error al parsear horarios:', error);
          configuracion.value.horariosSeleccionados = [];
        }
      } else {
        configuracion.value.horariosSeleccionados = [];
      }
    } else {
      // Nueva fecha sin configuración: establecer valores por defecto
      configuracion.value.tipoDia = 'laborable';
      configuracion.value.estado = 'Habilitado';
      // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    }
  } else {
    // Múltiples fechas seleccionadas: configuración por defecto
    configuracion.value.tipoDia = 'laborable';
    configuracion.value.estado = 'Habilitado';
    // ⬇️ AQUÍ: Asignar TODOS los horarios automáticamente para días laborables
    configuracion.value.horariosSeleccionados = [...todosLosHorarios];
  }
};



// Clases CSS
const getClasesDia = (fecha: Date | null): string => {
  if (!fecha) return 'dia-vacio';

  const clases = ['dia-calendario'];
  const fechaStr = fecha.toISOString().split('T')[0] ?? '';
  const hoy = new Date().toDateString();

  if (fecha.toDateString() === hoy) {
    clases.push('dia-hoy');
  }

  if (fechasSeleccionadas.value.includes(fechaStr)) {
    clases.push('dia-seleccionado');
  }

  return clases.join(' ');
};

const getClaseTipoDia = (fecha: Date): string => {
  const fechaStr = fecha.toISOString().split('T')[0];
  const entrada = datosCalendario.value.find((item) => item.fecha === fechaStr);

  if (!entrada) return '';

  switch (entrada.tipo_dia?.toLowerCase()) {
    case 'laborable':
      return 'tipo-laborable';
    case 'festivo':
      return 'tipo-festivo';
    case 'especial':
      return 'tipo-especial';
    default:
      return '';
  }
};

// Funciones auxiliares
const activarSeleccionMultiple = (): void => {
  seleccionMultiple.value = true;
};

const activarSeleccionUnica = (): void => {
  seleccionMultiple.value = false;
  if (fechasSeleccionadas.value.length > 1) {
    fechasSeleccionadas.value = fechasSeleccionadas.value.slice(0, 1);
  }
};

const removerFecha = (fecha: string): void => {
  fechasSeleccionadas.value = fechasSeleccionadas.value.filter((f) => f !== fecha);
};

const removerHorario = (horario: string): void => {
  configuracion.value.horariosSeleccionados = configuracion.value.horariosSeleccionados.filter(
    (h) => h !== horario,
  );
};

const formatFechaDisplay = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const aplicarConfiguracion = (): void => {
  console.log('Aplicando configuración:', {
    fechas: fechasSeleccionadas.value,
    configuracion: configuracion.value,
  });

  $q.notify({
    type: 'info',
    message: `Configuración aplicada a ${fechasSeleccionadas.value.length} día(s) - Guarda los cambios para aplicar en la base de datos`,
  });
};

const limpiarSeleccion = (): void => {
  fechasSeleccionadas.value = [];
  configuracion.value = {
    tipoDia: '',
    estado: 'Habilitado',
    horariosSeleccionados: [],
  };
};

// Funciones Supabase
const grabarSeleccion = async (): Promise<void> => {
  guardando.value = true;
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    if (!configuracion.value.tipoDia) {
      throw new Error('El tipo de día es obligatorio');
    }

    console.log('Intentando guardar en Supabase:', {
      fechas: fechasSeleccionadas.value,
      config: configuracion.value,
    });

    const resultados = [];

    for (const fecha of fechasSeleccionadas.value) {
      if (!fecha || typeof fecha !== 'string') {
        console.warn('Fecha inválida omitida:', fecha);
        continue;
      }

      const { data: existingData, error: selectError } = await supabase
        .from('Calendario')
        .select('id')
        .eq('fecha', fecha)
        .maybeSingle();

      if (selectError) {
        console.error('Error al verificar existencia:', selectError);
        throw selectError;
      }

      const horariosArray =
        configuracion.value.horariosSeleccionados.length > 0
          ? `{${configuracion.value.horariosSeleccionados.map((h) => `"${h}"`).join(',')}}`
          : null;

      const datosParaGuardar = {
        fecha: fecha,
        fecha_text: formatFechaDisplay(fecha),
        tipo_dia: configuracion.value.tipoDia,
        estado: configuracion.value.estado,
        horario: horariosArray,
        updated_at: new Date().toISOString(),
      };

      console.log(`Procesando fecha ${fecha}:`, {
        existe: !!existingData,
        datos: datosParaGuardar,
        horariosArray: horariosArray,
      });

      let resultado;
      if (existingData && existingData.id) {
        resultado = await supabase
          .from('Calendario')
          .update(datosParaGuardar)
          .eq('id', existingData.id);
      } else {
        resultado = await supabase.from('Calendario').insert([
          {
            ...datosParaGuardar,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      if (resultado.error) {
        console.error('Error en operación Supabase:', resultado.error);
        throw resultado.error;
      }

      resultados.push(resultado);
      console.log(`Operación exitosa para fecha ${fecha}`);
    }

    console.log('Todos los cambios guardados en Supabase:', resultados);

    $q.notify({
      type: 'positive',
      message: `${fechasSeleccionadas.value.length} día(s) guardado(s) correctamente en Supabase`,
      timeout: 3000,
    });

    await cargarDatosCalendario();
    limpiarSeleccion();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
    console.error('Error completo al guardar en Supabase:', error);
    $q.notify({
      type: 'negative',
      message: `Error al guardar: ${errorMessage}`,
      timeout: 5000,
    });
  } finally {
    guardando.value = false;
  }
};

const eliminarSeleccion = (): void => {
  try {
    if (!fechasSeleccionadas.value || fechasSeleccionadas.value.length === 0) {
      throw new Error('No hay fechas seleccionadas');
    }

    const fechasValidas = fechasSeleccionadas.value.filter(
      (fecha) => fecha && typeof fecha === 'string' && fecha.length > 0,
    );

    if (fechasValidas.length === 0) {
      throw new Error('No hay fechas válidas para eliminar');
    }

    console.log('Intentando eliminar fechas:', fechasValidas);

    $q.dialog({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${fechasValidas.length} día(s) del calendario?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const { error } = await supabase.from('Calendario').delete().in('fecha', fechasValidas);

          if (error) {
            console.error('Error al eliminar:', error);
            throw error;
          }

          console.log(`Eliminados ${fechasValidas.length} registros`);

          $q.notify({
            type: 'positive',
            message: `${fechasValidas.length} día(s) eliminado(s) correctamente`,
            timeout: 3000,
          });

          await cargarDatosCalendario();
          limpiarSeleccion();
        } catch (innerError: unknown) {
          const errorMessage =
            innerError instanceof Error ? innerError.message : 'Error desconocido al eliminar';
          console.error('Error al eliminar:', innerError);
          $q.notify({
            type: 'negative',
            message: `Error al eliminar: ${errorMessage}`,
            timeout: 5000,
          });
        }
      })();
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al eliminar:', error);
    $q.notify({
      type: 'negative',
      message: `Error al eliminar: ${errorMessage}`,
      timeout: 5000,
    });
  }
};

// Cargar datos de Supabase
const cargarDatosCalendario = async (): Promise<void> => {
  try {
    console.log('Cargando datos del calendario desde Supabase...');

    const { data, error } = await supabase
      .from('Calendario')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error de Supabase al cargar:', error);
      throw error;
    }

    datosCalendario.value = data || [];
    console.log('Datos del calendario cargados:', datosCalendario.value.length, 'registros');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido al cargar datos';
    console.error('Error al cargar datos:', error);
    $q.notify({
      type: 'negative',
      message: `Error al cargar los datos del calendario: ${errorMessage}`,
    });
  }
};

// Cargar usuario actual
const cargarUsuario = async (): Promise<void> => {
  try {
    const {
      data: { user: userData },
    } = await supabase.auth.getUser();
    user.value = userData;
    console.log('Usuario cargado:', userData?.email);
  } catch (error: unknown) {
    console.error('Error al cargar usuario:', error);
  }
};

// Inicialización
let subscription: ReturnType<typeof supabase.channel> | null = null;

onMounted(async (): Promise<void> => {
  await cargarUsuario();
  await cargarDatosCalendario();

  // Suscribirse a cambios en tiempo real
  subscription = supabase
    .channel('calendario-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Calendario',
      },
      () => {
        console.log('Cambio en tiempo real detectado');
        void cargarDatosCalendario();
      },
    )
    .subscribe();
});

onUnmounted(() => {
  if (subscription) {
    void subscription.unsubscribe();
  }
});
watch(
  () => configuracion.value.tipoDia,
  (nuevoTipo, tipoAnterior) => {
    // Solo aplicar si hay cambio real
    if (nuevoTipo === tipoAnterior) return;

    if (nuevoTipo === 'laborable') {
      // Al cambiar a laborable, asignar todos los horarios
      configuracion.value.horariosSeleccionados = [...todosLosHorarios];
    } else if (nuevoTipo === 'festivo' || nuevoTipo === 'especial') {
      // Al cambiar a festivo o especial, limpiar horarios
      configuracion.value.horariosSeleccionados = [];
    }
  }
);
</script>

<style scoped>
/* 🔧 SOLUCIÓN DEFINITIVA PARA TAMAÑOS DE CELDAS */

/* ⬇️ CONTROLAR ANCHO MEDIANTE EL GRID */
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  width: 100%;
}

/* ⬇️ CELDAS CON ANCHO AUTOMÁTICO BASADO EN EL GRID */
.celda-dia {
  width: 100%;
  height: 50px;
  border-radius: 8px;
}

.dia-calendario {
  border: 2px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dia-calendario:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.dia-seleccionado {
  background: linear-gradient(135deg, #4caf50, #388e3c) !important;
  border-color: #2e7d32 !important;
  color: white;
  transform: scale(1.05);
}

.dia-hoy {
  border: 3px solid #ff9800 !important;
  background-color: #fff3e0 !important;
  font-weight: bold;
}

.dia-vacio {
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
  cursor: default;
}

.contenido-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

.numero-dia {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
}

.dia-seleccionado .numero-dia {
  color: white;
  font-weight: 700;
}

/* 🔴 INDICADORES MÁS VISIBLES */
.indicador-tipo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tipo-laborable {
  background-color: #2196f3;
}

.tipo-festivo {
  background-color: #f44336;
}

.tipo-especial {
  background-color: #ff9800;
}

.dia-seleccionado .indicador-tipo {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 🔧 MENÚ LATERAL */
.sticky-menu {
  position: sticky;
  top: 20px;
  z-index: 100;
}

.menu-lateral {
  border-radius: 8px;
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #e3f2fd;
  transform: translateX(5px);
}

.menu-item.q-item--active {
  background-color: #1976d2;
  color: white;
}

.menu-item.q-item--active .q-icon {
  color: white;
}

/* 📱 RESPONSIVE MEJORADO */
@media (max-width: 1024px) {
  .celda-dia {
    height: 70px;
    padding: 4px;
  }

  .numero-dia {
    font-size: 1rem;
  }

  .indicador-tipo {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 768px) {
  .calendario-grid {
    gap: 2px;
  }

  .celda-dia {
    height: 60px;
    padding: 3px;
  }

  .numero-dia {
    font-size: 0.9rem;
  }

  .indicador-tipo {
    width: 16px;
    height: 16px;
  }

  .contenido-dia {
    gap: 4px;
  }

  .sticky-menu {
    position: relative;
    top: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .celda-dia {
    height: 50px;
    padding: 2px;
  }

  .numero-dia {
    font-size: 0.8rem;
  }

  .indicador-tipo {
    width: 14px;
    height: 14px;
    border-width: 1px;
  }

  .contenido-dia {
    gap: 2px;
  }
}

/* 🔧 FORZAR TAMAÑOS EN CASO DE CONFLICTOS */
:deep(.q-page) {
  min-height: calc(100vh - 50px);
}

:deep(.q-card) {
  overflow: visible;
}

:deep(.q-card-section) {
  padding: 16px;
}

/* Estilos para estados de carga */
.celda-dia.cargando {
  opacity: 0.6;
  cursor: wait;
}

.celda-dia.deshabilitado {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Efectos visuales mejorados */
.dia-calendario:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Animación para nuevos días seleccionados */
@keyframes seleccionarDia {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

.dia-seleccionado {
  animation: seleccionarDia 0.3s ease-out;
}

/* Mejora para días vacíos */
.dia-vacio:hover {
  transform: none;
  background-color: #f5f5f5;
  cursor: default;
}

/* Asegurar que el grid ocupe espacio consistente */
.calendario-grid::after {
  content: '';
  flex: auto;
}

/* Contenedor principal del calendario */
:deep(.calendario-container) {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

/* Estilos para las secciones de contenido */
.seccion-contenido {
  min-height: 600px;
}
</style>
