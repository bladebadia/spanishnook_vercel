<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="text-center q-mb-xl">
      <h4 class="text-weight-bold text-primary q-mb-sm">{{ $t('comprarPacks.packsCreditos') }}</h4>
      <p class="text-grey-8 text-subtitle1">
        {{ $t('comprarPacks.compraClases') }}
      </p>
    </div>

    <div class="row justify-center q-mb-lg">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="normal" :label="$t('comprarPacks.clasesGenerales')" icon="school" />
        <q-tab name="conversacion" :label="$t('comprarPacks.clasesConversacion')" icon="forum" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="normal">
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="pack in packsNormales" :key="pack.id">
            <q-card class="card-pack column">
              <div class="pack-header bg-primary text-white q-pa-md text-center">
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditos }} Créditos</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <q-badge
                  v-if="pack.ahorro"
                  color="red"
                  floating
                  transparent
                  style="top: 10px; right: 10px; font-size: 0.8rem; font-weight: bold"
                >
                  {{ pack.ahorro }}
                </q-badge>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-6 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm text-primary">
                  {{ pack.precio }}€
                </div>

                <div class="text-caption text-grey-7 q-mb-md">
                  Sale a <b>{{ (pack.precio / pack.creditos).toFixed(1) }}€</b> / clase
                </div>

                <div class="text-grey-8 text-body2">
                  {{ pack.descripcion }}
                </div>
              </q-card-section>

              <q-card-section>
                <q-btn
                  color="primary"
                  label="Comprar Pack"
                  class="full-width shadow-2"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  unelevated
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="conversacion">
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="pack in packsConversacion" :key="pack.id">
            <q-card class="card-pack column">
              <div class="pack-header bg-secondary text-white q-pa-md text-center">
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditos }} Créditos</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <q-badge
                  v-if="pack.ahorro"
                  color="red"
                  floating
                  transparent
                  style="top: 10px; right: 10px; font-size: 0.8rem; font-weight: bold"
                >
                  {{ pack.ahorro }}
                </q-badge>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-6 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm text-secondary">
                  {{ pack.precio }}€
                </div>

                <div class="text-caption text-grey-7 q-mb-md">
                  Sale a <b>{{ (pack.precio / pack.creditos).toFixed(1) }}€</b> / clase
                </div>

                <div class="text-grey-8 text-body2">
                  {{ pack.descripcion }}
                </div>
              </q-card-section>

              <q-card-section>
                <q-btn
                  color="secondary"
                  label="Comprar Pack"
                  class="full-width shadow-2"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  unelevated
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar } from 'quasar';

// 1. DEFINIMOS LA INTERFAZ PARA EVITAR ANY
interface PackCreditos {
  id: string;
  nombre: string;
  creditos: number;
  precio: number;
  precioOriginal?: number;
  descripcion: string;
  ahorro?: string;
  mejorOpcion?: boolean;
  tipo: 'normal' | 'conversacion';
}

const tab = ref('normal');
const loading = ref<string | null>(null);
const { user } = useAuth();
const $q = useQuasar();

// 2. TUS DATOS REALES DE STRIPE Y DISEÑO
const packsNormales: PackCreditos[] = [
  {
    id: 'price_1SvnLpLFUAzgw0DDFRC5kZ8e',
    nombre: 'Pack Inicio (5 Clases)',
    creditos: 5,
    precio: 145,
    precioOriginal: 160,
    descripcion: 'Ideal para probar.',
    ahorro: '- 12€',
    tipo: 'normal',
  },
  {
    id: 'price_1SvnMcLFUAzgw0DDKHgGGSJM',
    nombre: 'Pack Pro (10 Clases)',
    creditos: 10,
    precio: 260,
    precioOriginal: 320,
    descripcion: 'Para estudiantes constantes.',
    ahorro: '- 48€',
    mejorOpcion: true,
    tipo: 'normal',
  },
];

const packsConversacion: PackCreditos[] = [
  {
    id: 'price_1SvnOFLFUAzgw0DDywhQyqd5',
    nombre: 'Pack Charla 5',
    creditos: 5,
    precio: 125,
    precioOriginal: 135,
    descripcion: '5 sesiones de conversación.',
    ahorro: 'Ahorras 10€',
    tipo: 'conversacion',
  },
  {
    id: 'price_1SvnP3LFUAzgw0DD5duLB3mi',
    nombre: 'Pack Fluidez',
    creditos: 10,
    precio: 215,
    precioOriginal: 270,
    descripcion: 'El más popular para ganar soltura.',
    ahorro: 'Ahorras 55€',
    mejorOpcion: true,
    tipo: 'conversacion',
  },
];

// 3. FUNCIÓN DE COMPRA (Tipada correctamente)
const comprarPack = async (pack: PackCreditos) => {
  if (!user.value) {
    $q.notify({ type: 'warning', message: 'Debes iniciar sesión para comprar.' });
    return;
  }

  loading.value = pack.id;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Llamada a la función específica de Bonos
    const response = await fetch(
      'https://zleqsdfpjepdangitcxv.supabase.co/functions/v1/create-bono-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: pack.id,
          userId: user.value.id,
          userEmail: user.value.email,
          packCreditos: pack.creditos,
          packTipo: pack.tipo,
          successUrl: window.location.origin + '/AreaPersonal',
          cancelUrl: window.location.origin + '/ComprarPacks',
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Error al conectar con Stripe');
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error: unknown) {
    console.error(error);

    // Manejo seguro del error sin any
    let mensaje = 'Error desconocido';
    if (error instanceof Error) {
      mensaje = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      mensaje = String((error as { message: string }).message);
    }

    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    loading.value = null;
  }
};
</script>

<style scoped>
.card-pack {
  border-radius: 16px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  height: 100%;
}
.card-pack:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
.text-strike {
  text-decoration: line-through;
}
</style>
