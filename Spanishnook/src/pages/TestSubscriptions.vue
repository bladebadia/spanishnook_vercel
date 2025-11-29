<template>
  <q-page padding class="column items-center q-gap-lg">
    <div class="text-h4 text-primary">🧪 Test de Suscripciones</div>

    <div class="row q-col-gutter-md justify-center full-width" style="max-width: 900px">
      <div class="col-12 col-md-5">
        <q-card class="text-center q-pa-md">
          <q-card-section>
            <div class="text-h6">Clases de Conversación</div>
            <div class="text-subtitle2 text-grey">Practica hablando</div>

            <div v-if="datosPrecios.conversacion" class="text-h4 text-positive q-mt-sm">
              {{ datosPrecios.conversacion }}€<span class="text-caption">/mes</span>
            </div>
            <div v-else class="q-mt-sm flex flex-center">
              <q-spinner color="secondary" size="1.5em" />
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              color="secondary"
              icon="forum"
              label="Suscribirse (Opción A)"
              :loading="procesando"
              @click="suscribirse('conversacion')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="text-center q-pa-md">
          <q-card-section>
            <div class="text-h6">Curso por Niveles</div>
            <div class="text-subtitle2 text-grey">Gramática y estructura</div>

            <div v-if="datosPrecios.niveles" class="text-h4 text-primary q-mt-sm">
              {{ datosPrecios.niveles }}€<span class="text-caption">/mes</span>
            </div>
            <div v-else class="q-mt-sm flex flex-center">
              <q-spinner color="primary" size="1.5em" />
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              color="primary"
              icon="school"
              label="Suscribirse (Opción B)"
              :loading="procesando"
              @click="suscribirse('niveles')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-separator class="full-width q-my-md" />

    <div class="full-width" style="max-width: 800px">
      <div class="text-h5 q-mb-md">📋 Mis Suscripciones Activas</div>

      <q-banner v-if="!user" class="bg-warning text-white q-mb-md">
        Debes iniciar sesión para ver tus suscripciones.
      </q-banner>

      <div v-else>
        <q-btn
          flat
          icon="refresh"
          label="Refrescar lista"
          @click="cargarSuscripciones"
          color="primary"
          class="q-mb-sm"
        />

        <q-list
          bordered
          separator
          v-if="misSuscripciones.length > 0"
          class="bg-white rounded-borders"
        >
          <q-item v-for="sub in misSuscripciones" :key="sub.id">
            <q-item-section avatar>
              <q-icon
                :name="sub.cancel_at_period_end ? 'event_busy' : 'check_circle'"
                :color="sub.cancel_at_period_end ? 'orange' : 'positive'"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ obtenerNombreCurso(sub.course_id) }}
              </q-item-label>

              <q-item-label caption>
                Estado:
                <q-badge :color="sub.estado === 'active' ? 'positive' : 'grey'">
                  {{ sub.estado }}
                </q-badge>
                <q-badge v-if="sub.cancel_at_period_end" color="orange" class="q-ml-sm">
                  Cancelación programada
                </q-badge>
              </q-item-label>

              <q-item-label caption class="text-grey-8">
                {{ sub.cancel_at_period_end ? 'Acceso válido hasta:' : 'Próxima renovación:' }}
                <strong>{{ formatearFecha(sub.current_period_end) }}</strong>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn
                  v-if="!sub.cancel_at_period_end && sub.estado === 'active'"
                  flat
                  round
                  color="negative"
                  icon="cancel"
                  @click="confirmarCancelacion(sub)"
                >
                  <q-tooltip>Cancelar suscripción</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="sub.cancel_at_period_end && sub.estado === 'active'"
                  flat
                  round
                  color="positive"
                  icon="restore"
                  @click="reactivarSuscripcion(sub)"
                >
                  <q-tooltip>Reactivar renovación automática</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center text-grey q-pa-lg border-dashed">
          No tienes suscripciones registradas.
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { procesando, handleSubscribe, cambiarEstadoCancelacion } = useSuscripciones();
const { user } = useAuth();

// Interface actualizada con los campos necesarios
interface Suscripcion {
  id: string;
  course_id: number;
  stripe_subscription_id: string; // Importante para cancelar
  estado: string;
  current_period_end: string;
  cancel_at_period_end: boolean; // Importante para la UI
  created_at: string;
}

const misSuscripciones = ref<Suscripcion[]>([]);
const datosPrecios = ref({ conversacion: null as number | null, niveles: null as number | null });

// ⚠️ IDs REALES DE STRIPE
const PRICE_ID_CONVERSACION = 'price_1SXvSpLFUAzgw0DDMUPJgHzv';
const PRICE_ID_NIVELES = 'price_1SXvZ6LFUAzgw0DDUBrvyDSQ';

// --- LOGICA DE PRECIOS ---
const obtenerPrecioStripe = async (priceId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-webhook', {
      body: { action: 'get_price_details', priceId: priceId },
    });
    if (error || !data || !data.amount) return null;
    return data.amount / 100;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const cargarPrecios = async () => {
  const [precioA, precioB] = await Promise.all([
    obtenerPrecioStripe(PRICE_ID_CONVERSACION),
    obtenerPrecioStripe(PRICE_ID_NIVELES),
  ]);
  datosPrecios.value.conversacion = precioA;
  datosPrecios.value.niveles = precioB;
};

// --- LOGICA SUSCRIPCION / CANCELACIÓN ---
const suscribirse = async (tipo: 'conversacion' | 'niveles') => {
  const priceId = tipo === 'conversacion' ? PRICE_ID_CONVERSACION : PRICE_ID_NIVELES;
  const realCourseId = tipo === 'conversacion' ? 1 : 2;
  await handleSubscribe(priceId, realCourseId.toString());
};

const confirmarCancelacion = (sub: Suscripcion) => {
  const fechaFin = formatearFecha(sub.current_period_end);

  $q.dialog({
    title: '¿Cancelar Suscripción?',
    message: `Seguirás teniendo acceso al curso hasta el <b>${fechaFin}</b>, pero no se te volverá a cobrar.`,
    html: true,
    persistent: true,
    ok: { label: 'Sí, cancelar', color: 'negative', flat: true },
    cancel: { label: 'Volver', color: 'primary' }, // Este es el que vale
  }).onOk(() => {
    void (async () => {
      const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, true);
      if (exito) await cargarSuscripciones();
    })();
  });
};

const reactivarSuscripcion = async (sub: Suscripcion) => {
  // Llamamos a la función con FALSE (No cancelar / Reactivar)
  const exito = await cambiarEstadoCancelacion(sub.stripe_subscription_id, false);
  if (exito) await cargarSuscripciones();
};

// --- CARGA DE DATOS ---
const cargarSuscripciones = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    misSuscripciones.value = data as Suscripcion[];
  }
};

// --- HELPERS ---
const obtenerNombreCurso = (id: number) => {
  if (id === 1) return 'Clases de Conversación';
  if (id === 2) return 'Curso por Niveles';
  return `Curso ID: ${id}`;
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return '---';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

onMounted(() => {
  void cargarSuscripciones();
  void cargarPrecios();
});
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #ccc;
  border-radius: 8px;
}
</style>
