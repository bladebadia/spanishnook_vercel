<template>
  <q-page padding class="column items-center q-gap-lg">
    <div class="text-h4 text-primary">🧪 Test de Suscripciones</div>

    <div class="row q-col-gutter-md justify-center full-width" style="max-width: 900px">
      <div class="col-12 col-md-5">
        <q-card class="text-center q-pa-md">
          <q-card-section>
            <div class="text-h6">Clases de Conversación</div>
            <div class="text-subtitle2 text-grey">Practica hablando</div>
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
              <q-icon name="check_circle" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">ID Curso: {{ sub.course_id }}</q-item-label>
              <q-item-label caption>Estado: {{ sub.estado }}</q-item-label>
              <q-item-label caption
                >Renueva: {{ new Date(sub.current_period_end).toLocaleDateString() }}</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-badge :color="sub.estado === 'active' ? 'positive' : 'grey'">{{
                sub.estado
              }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center text-grey q-pa-lg border-dashed">
          No tienes suscripciones activas registradas en la base de datos.
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

const { procesando, handleSubscribe } = useSuscripciones();
const { user } = useAuth();

const misSuscripciones = ref<unknown[]>([]);

// ⚠️ IMPORTANTE: Pon aquí los IDs reales de Stripe que creaste
const PRICE_ID_CONVERSACION = 'price_1SXvSpLFUAzgw0DDMUPJgHzv';
const PRICE_ID_NIVELES = 'price_1SXvZ6LFUAzgw0DDUBrvyDSQ';

const suscribirse = async (tipo: 'conversacion' | 'niveles') => {
  const priceId = tipo === 'conversacion' ? PRICE_ID_CONVERSACION : PRICE_ID_NIVELES;
  
  // AHORA USAMOS IDs REALES (Números)
  // '1' para conversación, '2' para niveles (o los IDs que tengas en tu tabla 'cursos_grupales')
  const realCourseId = tipo === 'conversacion' ? 1 : 2;

  // Nota: handleSubscribe espera string, así que convertimos el número a string
  await handleSubscribe(priceId, realCourseId.toString());
};

const cargarSuscripciones = async () => {
  if (!user.value) return;

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    misSuscripciones.value = data;
  }
};

onMounted(() => {
  void cargarSuscripciones();
});
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #ccc;
  border-radius: 8px;
}
</style>
