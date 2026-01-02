<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <p class="titulo-responsivo text-center q-my-xl" style="width: 100%; color: #851319">
        {{ t('individuales.reservaTuClase') }}
      </p>

      <div class="col-12 col-md-5">
        <div v-if="carrito.length > 0" class="q-mb-lg bg-yellow-2 q-pa-md rounded-borders shadow-2">
          <h5>🛒 {{ t('individuales.carritoDeReservas') }}</h5>
          <q-list>
            <q-item v-for="(reserva, index) in carrito" :key="index">
              <q-item-section>
                <q-item-label
                  >{{ formatFecha(reserva.fecha) }} {{ t('individuales.aLas') }}
                  {{ reserva.hora }}</q-item-label
                >
                <q-item-label caption>
                  {{ reserva.tipo === 'normal' ? 'Clase Normal' : 'Conversación' }} ({{
                    reserva.tipo === 'normal' ? '32€' : '20€'
                  }})
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
              <q-btn
                color="primary"
                :label="t('individuales.botonIrAlCarrito')"
                to="/CarritoCompra"
              />
            </div>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <h5>{{ t('individuales.misReservasConfirmadas') }}</h5>
          <q-list bordered v-if="misReservas.length > 0">
            <q-item v-for="reserva in misReservas" :key="reserva.id" class="q-mb-sm">
              <q-item-section>
                <q-item-label
                  >{{ formatFecha(reserva.fecha) }} {{ t('individuales.aLas') }}
                  {{ reserva.hora.slice(0, 5) }}</q-item-label
                >
                <q-item-label caption
                  >{{ getTipoClaseTexto(reserva) }} - {{ getPrecioClase(reserva) }}€</q-item-label
                >
                <q-item-label caption v-if="!puedeCancelar(reserva)" class="text-negative">
                  {{ t('individuales.noSePuede') }}
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
                      : t('individuales.cancelarReserva')
                  "
                />
              </q-item-section>
            </q-item>
          </q-list>
          <p v-else class="text-grey q-mt-sm">{{ t('individuales.noTienesReservas') }}</p>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="q-mb-md">
          <q-card class="q-pa-md shadow-1 rounded-borders">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-center q-mb-md">{{ t('individuales.tipoDeClase') }}</div>
              <q-option-group
                v-model="tipoClase"
                :options="opcionesTipoClase"
                color="primary"
                inline
                class="justify-center"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="q-mb-xl">
          <div v-if="cargando" class="text-center q-pa-xl">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey q-mt-md">Cargando disponibilidad...</div>
          </div>

          <q-date
            v-else
            v-model="fechaSeleccionada"
            :options="opcionesFechasComputed"
            :min="fechaMinima"
            :max="fechaMaxima"
            :events="fechasConEventos"
            event-color="red-9"
            landscape
            class="custom-calendar shadow-1 rounded-borders"
            today-btn
            mask="YYYY-MM-DD"
            color="primary"
            text-color="white"
            first-day-of-week="1"
          />
        </div>

        <div v-if="fechaSeleccionada" class="q-mt-lg">
          <h5>
            {{ t('individuales.horariosDisponiblesPara') }} {{ formatFecha(fechaSeleccionada) }}
          </h5>
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
          <div v-else class="text-grey q-mt-md">
            <q-icon name="event_busy" /> No hay huecos libres (revisa si hay un curso grupal ese
            día).
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReservasClases } from 'src/composables/useReservasClases';
import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';

const { t } = useI18n();
const cargando = ref(true);

const {
  fechaSeleccionada,
  misReservas,
  carrito,
  tipoClase,
  opcionesTipoClase,
  fechaMinima,
  fechaMaxima,
  fechasConEventos,
  horariosDisponiblesFiltrados,
  opcionesFechasComputed,
  getTipoClaseTexto,
  getPrecioClase,
  formatFecha,
  estaEnCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  puedeCancelar,
  cancelarReserva,
  inicializar,
} = useReservasClases();

onMounted(async () => {
  try {
    await inicializar();
  } catch (e) {
    console.error('Error inicializando:', e);
  } finally {
    // Quitamos el spinner tras intentar cargar
    cargando.value = false;
  }
});
</script>
