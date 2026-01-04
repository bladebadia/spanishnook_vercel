<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <p class="titulo-responsivo text-center q-my-xl" style="width: 100%; color: #851319">
        {{ t('reservasClases.reservaTuClase') }}
      </p>

      <div class="col-12 col-md-5">
        <div v-if="user" class="q-mb-lg">
          <SaldoWallet
            :saldo-normal="saldoNormal"
            :saldo-conversacion="saldoConversacion"
            :loading="cargandoSaldo"
          />
        </div>

        <div v-if="carrito.length > 0" class="q-mb-lg bg-yellow-2 q-pa-md rounded-borders shadow-2">
          <h5>🛒 {{ t('reservasClases.carritoDeReservas') }}</h5>
          <q-list>
            <q-item v-for="(reserva, index) in carrito" :key="index">
              <q-item-section>
                <q-item-label>
                  {{ formatFecha(reserva.fecha) }} {{ t('reservasClases.aLas') }} {{ reserva.hora }}
                </q-item-label>
                <q-item-label caption>
                  {{
                    reserva.tipo === 'normal'
                      ? t('reservasClases.claseNormal')
                      : t('reservasClases.conversacion')
                  }}
                  ({{ reserva.tipo === 'normal' ? '32€' : '20€' }})
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  color="negative"
                  icon="remove"
                  @click="quitarDelCarrito(index)"
                  size="sm"
                  round
                  flat
                />
              </q-item-section>
            </q-item>
            <div class="q-mt-md text-center">
              <q-btn
                color="primary"
                :label="t('reservasClases.botonIrAlCarrito')"
                to="/CarritoCompra"
              />
            </div>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <h5>{{ t('reservasClases.misReservasConfirmadas') }}</h5>

          <q-list bordered separator v-if="misReservas.length > 0" class="rounded-borders bg-white">
            <q-item v-for="reserva in misReservas" :key="reserva.id" class="q-py-md">
              <q-item-section avatar>
                <q-avatar
                  :color="reserva.tipo === 'conversacion' ? 'purple-1' : 'blue-1'"
                  :text-color="reserva.tipo === 'conversacion' ? 'purple-8' : 'blue-8'"
                  icon="event"
                  size="md"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ formatFecha(reserva.fecha) }}
                </q-item-label>
                <q-item-label caption class="text-grey-8">
                  A las {{ reserva.hora.slice(0, 5) }} | {{ getTipoClaseTexto(reserva) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge color="positive" outline label="Reservada" />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-grey q-mt-sm q-pa-md text-center border-dashed">
            {{ t('reservasClases.noTienesReservas') }}
          </div>

          <div class="text-center q-mt-md text-caption text-grey">
            * Para cancelar reservas, ve a tu
            <router-link to="/AreaPersonal" class="text-primary">Área Personal</router-link>.
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="q-mb-md">
          <q-card class="q-pa-md shadow-1 rounded-borders">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-center q-mb-md">{{ t('reservasClases.tipoDeClase') }}</div>
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
            <div class="text-grey q-mt-md">{{ t('reservasClases.cargandoDisponibilidad') }}</div>
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
            {{ t('reservasClases.horariosDisponiblesPara') }} {{ formatFecha(fechaSeleccionada) }}
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
            <q-icon name="event_busy" /> {{ t('reservasClases.noHayHuecosLibres') }}
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
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import SaldoWallet from 'components/SaldoWallet.vue';

import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';

const { t } = useI18n();
const { user } = useAuth();
const cargando = ref(true);

// Variables saldo local
const saldoNormal = ref(0);
const saldoConversacion = ref(0);
const cargandoSaldo = ref(false);

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
  formatFecha,
  estaEnCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  inicializar,
} = useReservasClases();

const cargarSaldoUsuario = async () => {
  if (!user.value?.id) return;
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
    console.error('Error cargando saldo:', e);
  } finally {
    cargandoSaldo.value = false;
  }
};

onMounted(async () => {
  try {
    const promesas = [inicializar()];
    if (user.value) promesas.push(cargarSaldoUsuario());
    await Promise.all(promesas);
  } catch (e) {
    console.error('Error inicializando:', e);
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.border-dashed {
  border: 1px dashed #ccc;
  border-radius: 4px;
}
</style>
