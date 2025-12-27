<template>
  <q-page class="q-pa-lg">
      <div class="row q-col-gutter-lg">
        <p class="titulo-responsivo text-center q-my-xl" style="width: 100%; color: #851319">
          {{ t('individuales.reservaTuClase') }}
        </p>
        
        <!-- Debug info (temporal - elimina después de verificar) -->
        <div class="col-12 q-mb-md bg-blue-1 q-pa-sm rounded-borders">
          <div class="text-caption">
            <strong>Debug:</strong> 
            📅 Días en calendario: {{ calendario.length }} | 
            ✅ Días con eventos: {{ fechasConEventos.length }} | 
            🔢 Días disponibles: {{ diasDisponiblesCount }}
          </div>
        </div>

        <!-- Columna izquierda: Carrito + Reservas -->
        <div class="col-12 col-md-5">
          <!-- Carrito -->
          <div v-if="carrito.length > 0" class="q-mb-lg bg-yellow-2 q-pa-md rounded-borders shadow-2">
            <h5>🛒{{ t('individuales.carritoDeReservas') }}</h5>
            <q-list>
            <q-item v-for="(reserva, index) in carrito" :key="index">
              <q-item-section>
                <q-item-label>
                  {{ formatFecha(reserva.fecha) }} {{ t('individuales.aLas') }} {{ reserva.hora }}
                </q-item-label>
                <q-item-label caption>
                  {{ reserva.tipo === 'normal' ? t('individuales.claseNormal') : t('individuales.claseConversacion') }} -
                  {{ reserva.tipo === 'normal' ? '32€' : '20€' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  color="negative"
                  icon="remove"
                  @click="quitarDelCarrito(index)"
                  size="sm"
                  round
                />
              </q-item-section>
            </q-item>
            <div class="q-mt-md text-center">
              <q-btn color="primary" :label="t('individuales.botonIrAlCarrito')" to="/CarritoCompra" />
            </div>
            </q-list>
          </div>

          <!-- Mis reservas -->
          <div class="q-mt-lg">
            <h5>{{ t('individuales.misReservasConfirmadas') }}</h5>
            <q-list bordered v-if="misReservas.length > 0">
              <q-item v-for="reserva in misReservas" :key="reserva.id" class="q-mb-sm">
                <q-item-section>
                  <q-item-label>
                    {{ formatFecha(reserva.fecha) }} {{ t('individuales.aLas') }} {{ reserva.hora.slice(0, 5) }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ getTipoClaseTexto(reserva) }} - {{ getPrecioClase(reserva) }}€
                  </q-item-label>
                  <q-item-label caption v-if="!puedeCancelar(reserva)" class="text-negative">
                    {{t('individuales.noSePuede')}}
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
                        ? t('individuales.noSePuedeCancelar')
                        : t('individuales.cancelarReserva') " />
                </q-item-section>
              </q-item>
            </q-list>
            <p v-else class="text-grey q-mt-sm">{{t('individuales.noTienesReservas')}}</p>
          </div>
        </div>

      <!-- Columna derecha: Selector + Calendario + Horarios -->
      <div class="col-12 col-md-6">
        <div class="q-mb-md">
          <q-card class="q-pa-md shadow-1 rounded-borders">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-center q-mb-md">{{t('individuales.tipoDeClase')}}</div>
                <q-option-group
                  v-model="tipoClase"
                  :options="opcionesTipoClase"
                  color="primary"
                  inline
                  class="justify-center"
                  />
              <div class="text-center q-mt-sm">
                <q-badge color="primary" class="q-px-sm q-py-xs text-subtitle1">
                  {{t('individuales.precio')}} {{ tipoClase === 'normal' ? '32€' : '20€' }}
                </q-badge>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Calendario -->
        <div class="q-mb-xl">
          <q-date
            v-if="calendarioCargado"
        v-model="fechaSeleccionada"
        :options="opcionesFechasComputed"
        :min="fechaMinima"
        :max="fechaMaxima"
        :events="fechasConEventos"
        event-color="orange"
        landscape
        class="custom-calendar shadow-1 rounded-borders"
        today-btn
        mask="YYYY-MM-DD"
        color="primary"
        text-color="white"
        first-day-of-week="1"
        @update:model-value="handleFechaSeleccionada"
          />
          <div v-else class="text-center q-pa-xl">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey q-mt-md">Cargando calendario...</div>
          </div>
        </div>

        <!-- Horarios disponibles -->
        <div v-if="fechaSeleccionada" class="q-mt-lg">
          <h5>{{t('individuales.horariosDisponiblesPara')}} {{ formatFecha(fechaSeleccionada) }}</h5>

          <div v-if="horariosDisponiblesFiltrados.length > 0" class="row q-gutter-sm q-mt-md">
            <q-btn
              v-for="hora in horariosDisponiblesFiltrados"
              :key="hora"
              :color="estaEnCarrito(hora) ? 'orange' : 'primary'"
              :label="hora"
              @click="agregarAlCarrito(hora)"
              outline
              class="time-btn"
            />
          </div>

          <div v-else class="text-grey q-mt-md">No hay horarios disponibles para esta fecha.</div>
        </div>
      </div>

  </div>

  </q-page>

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservasClases } from 'src/composables/useReservasClases';
import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';

const { t } = useI18n();

// Usar el composable para toda la lógica
const {
  // Estado reactivo
  fechaSeleccionada,
  misReservas,
  carrito,
  tipoClase,
  calendario,

  // Computed properties
  opcionesTipoClase,
  fechaMinima,
  fechaMaxima,
  fechasConEventos,
  horariosDisponiblesFiltrados,
  opcionesFechasComputed,

  // Métodos
  opcionesFechas,
  getTipoClaseTexto,
  getPrecioClase,
  formatFecha,
  estaEnCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  puedeCancelar,
  cancelarReserva,
} = useReservasClases();

// Estado para controlar cuándo el calendario está listo
const calendarioCargado = ref(false);

// Computed para contar días disponibles (debug)
const diasDisponiblesCount = computed(() => {
  return calendario.value.filter(d => 
    (d.tipo_dia === 'laborable' || d.tipo_dia === 'especial') && 
    d.horario.length > 0
  ).length;
});

// Wrapper para la función options que fuerza reactividad
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const opcionesFechasWrapper = (fecha: string): boolean => {
  const resultado = opcionesFechas(fecha);
  return resultado;
};

// Handler para fecha seleccionada con debug
const handleFechaSeleccionada = (val: string) => {
  console.log('📅 Fecha seleccionada:', val);
  const diaInfo = calendario.value.find(d => d.fecha === val);
  if (diaInfo) {
    console.log('✅ Info del día:', diaInfo);
  }
};

// Watch para detectar cuándo se carga el calendario
watch(() => calendario.value.length, (nuevoLength) => {
  console.log('📊 Calendario actualizado. Total días:', nuevoLength);
  if (nuevoLength > 0) {
    calendarioCargado.value = true;
    console.log('✅ Calendario marcado como cargado');
  }
}, { immediate: true });

// Watch para debug de eventos
watch(() => fechasConEventos.value, (eventos) => {
  console.log('🎯 Fechas con eventos actualizadas:', eventos);
}, { immediate: true });
</script>