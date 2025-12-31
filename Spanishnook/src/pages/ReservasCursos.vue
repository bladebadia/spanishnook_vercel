<template>
  <q-page class="q-pa-lg reservas-page">
    <div v-if="cargando" class="flex flex-center q-my-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <div v-else-if="!curso">
      <q-card flat bordered class="q-pa-xl text-center">
        <q-icon name="error_outline" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">Curso no encontrado</div>
        <div class="text-caption q-mt-sm">Verifica el enlace o vuelve atrás.</div>
        <q-btn color="primary" class="q-mt-md" :to="rutaClases" label="Volver a cursos" />
      </q-card>
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5 text-weight-bold" style="color: #851319">
              {{ curso.nombre_curso }}
            </div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs">
              Estado:
              <q-chip size="sm" :color="colorEstado" text-color="white" dense>
                {{ curso.estado_curso }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-body2 q-mb-sm">
              {{ curso.descripcion || 'Sin descripción disponible.' }}
            </div>

            <div class="text-body2 q-mt-sm">
              <div v-if="curso.nivel"><strong>Nivel:</strong> {{ curso.nivel }}</div>
              <div v-if="curso.precio_curso">
                <strong>Precio del curso:</strong> {{ curso.precio_curso }}
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-12 col-md-6">
                <q-list dense bordered class="rounded-borders">
                  <q-item-label header>Días de la semana</q-item-label>
                  <q-item v-for="d in curso.dias_semana" :key="d">
                    <q-item-section avatar><q-icon name="event" color="primary" /></q-item-section>
                    <q-item-section>{{ d }}</q-item-section>
                  </q-item>
                  <q-item v-if="!curso.dias_semana?.length" dense>
                    <q-item-section caption>Sin días asignados</q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <q-list dense bordered class="rounded-borders">
                  <q-item-label header>Horarios</q-item-label>
                  <q-item v-for="h in curso.horarios_curso" :key="h">
                    <q-item-section avatar
                      ><q-icon name="schedule" color="primary"
                    /></q-item-section>
                    <q-item-section>{{ h }}</q-item-section>
                  </q-item>
                  <q-item v-if="!curso.horarios_curso?.length" dense>
                    <q-item-section caption>Sin horarios</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold" style="color: #851319">
              {{ esCursoActivo ? 'Inscripción al Curso' : 'Reserva tu plaza' }}
            </div>

            <div v-if="autenticado" class="text-caption text-grey-7">
              Estás autenticado. Puedes reservar directamente.
            </div>
            <div v-else class="text-caption text-grey-7">
              {{
                esCursoActivo
                  ? 'Inicia sesión para suscribirte.'
                  : 'No has iniciado sesión. Puedes registrarte o reservar con tu email.'
              }}
            </div>
          </q-card-section>

          <q-separator />

          <div v-if="esCursoActivo">
            <q-card-section class="text-center">
              <div class="text-h4 text-weight-bold q-my-md" style="color: #851319">
                {{ curso.precio_curso }}<span class="text-caption">/mes</span>
              </div>

              <div v-if="autenticado" class="column items-center">
                <q-btn
                  color="primary"
                  size="lg"
                  icon="credit_card"
                  label="Suscribirse Ahora"
                  :loading="procesando"
                  @click="iniciarSuscripcion"
                  class="q-px-xl"
                />
                <div class="text-caption q-mt-sm text-grey">Pago seguro vía Stripe</div>
              </div>

              <div v-else>
                <q-btn
                  outline
                  color="primary"
                  class="full-width q-mb-sm"
                  :to="rutaLogin"
                  label="Iniciar Sesión para Inscribirse"
                />
              </div>
            </q-card-section>
          </div>

          <div v-else>
            <q-card-section v-if="autenticado" class="column items-center text-center">
              <q-btn
                color="primary"
                icon="event_available"
                :disable="!aceptaCondiciones"
                :loading="reservando"
                label="Unirme a lista de espera"
                @click="confirmarReservaAutenticado"
                class="q-px-xl q-mb-md"
                size="md"
              />

              <q-checkbox
                v-model="aceptaCondiciones"
                label="Acepto las condiciones y la política de privacidad"
                dense
                size="sm"
                color="primary"
              />

              <q-banner
                v-if="yaEnListaEspera"
                dense
                class="bg-orange-1 text-orange-9 q-mt-md rounded-borders"
              >
                Ya estás en lista de espera o reserva registrada.
              </q-banner>
            </q-card-section>

            <q-card-section v-else class="column items-center">
              <div class="full-width">
                <q-input
                  v-model="formGuest.nombre"
                  label="Tu nombre"
                  dense
                  filled
                  class="q-mb-sm"
                  :rules="[(val) => !!val || 'Requerido']"
                />
                <q-input
                  v-model="formGuest.email"
                  label="Tu email"
                  dense
                  filled
                  class="q-mb-sm"
                  :rules="[(val) => !!val || 'Requerido']"
                  type="email"
                />
              </div>

              <q-btn
                color="primary"
                icon="event_available"
                :disable="!formGuestValido || reservando"
                :loading="reservando"
                label="Avisadme por email"
                @click="confirmarReservaGuest"
                class="q-mt-sm q-px-xl"
              />

              <q-checkbox
                v-model="aceptaCondicionesGuest"
                label="Acepto las condiciones y la política de privacidad"
                class="q-mt-md"
                dense
                size="sm"
              />

              <q-btn
                flat
                color="primary"
                class="q-mt-md"
                icon="login"
                label="Registrarme / Iniciar sesión"
                :to="rutaLogin"
                size="sm"
              />

              <q-banner
                v-if="yaEnListaEspera"
                dense
                class="bg-orange-1 text-orange-9 q-mt-sm full-width"
              >
                Tu email ya está registrado para este curso.
              </q-banner>
            </q-card-section>

            <q-card-section>
              <div class="text-caption text-center text-grey-6">
                Al reservar aceptas nuestras condiciones. Te avisaremos cuando se abra el curso.
              </div>
            </q-card-section>
          </div>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialogConfirm" persistent>
      <q-card style="max-width: 420px">
        <q-card-section>
          <div class="text-h6">Confirmar</div>
          <div class="text-body2 q-mt-sm">
            ¿Deseas unirte a la lista de espera para <strong>{{ curso?.nombre_curso }}</strong
            >?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            color="primary"
            label="Confirmar"
            :loading="reservando"
            @click="reservarAutenticado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGuestConfirm" persistent>
      <q-card style="max-width: 420px">
        <q-card-section>
          <div class="text-h6">Confirmar</div>
          <div class="text-body2 q-mt-sm">
            ¿Confirmas con el email <strong>{{ formGuest.email }}</strong
            >?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="primary" label="Confirmar" :loading="reservando" @click="reservarGuest" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useSuscripciones } from 'src/composables/useSuscripciones'; // Composable de pagos

const $q = useQuasar();
const route = useRoute();
const { procesando, handleSubscribe } = useSuscripciones(); // Lógica de Stripe

interface CursoGrupal {
  id?: number;
  nombre_curso: string;
  estado_curso: string;
  descripcion?: string;
  usuarios?: string[];
  lista_espera?: string[];
  nivel?: string;
  precio_curso?: string;
  dias_semana?: string[];
  horarios_curso?: string[];
  stripe_price_id?: string; // ⚠️ Necesario en la base de datos
}

const curso = ref<CursoGrupal | null>(null);
const cargando = ref(true);
const reservando = ref(false);
const user = ref<User | null>(null);

const autenticado = computed(() => !!user.value);
const rutaClases = '/NuestrasClases';
const rutaLogin = '/Acceder'; // Cambiado a 'Acceder' que es tu ruta habitual

// Computed para saber si está activo y mostramos pasarela
const esCursoActivo = computed(() => curso.value?.estado_curso === 'Activo');

const colorEstado = computed(() => {
  switch (curso.value?.estado_curso) {
    case 'Activo':
      return 'positive';
    case 'En reserva':
      return 'orange';
    case 'Completo':
      return 'primary'; // Rojo al estar completo
    default:
      return 'grey';
  }
});

// Variables formularios
const aceptaCondiciones = ref(false);
const aceptaCondicionesGuest = ref(false);
const dialogConfirm = ref(false);
const dialogGuestConfirm = ref(false);
const formGuest = ref({ nombre: '', email: '' });

const formGuestValido = computed(
  () => !!formGuest.value.nombre && !!formGuest.value.email && aceptaCondicionesGuest.value,
);

const yaEnListaEspera = computed(() => {
  if (!curso.value) return false;
  const valor = user.value?.id || formGuest.value.email || '';
  return (curso.value.lista_espera || []).includes(valor);
});

// --- FUNCIONES ---

const cargarUsuario = async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
};

const cargarCurso = async () => {
  cargando.value = true;
  try {
    const idNum = Number(route.params.id || route.query.id);
    if (isNaN(idNum)) throw new Error('ID no válido');

    const { data, error } = await supabase
      .from('cursos_grupales')
      .select('*')
      .eq('id', idNum)
      .maybeSingle();

    if (error) throw error;

    // Mapeo seguro de arrays
    if (data) {
      curso.value = {
        ...data,
        dias_semana: Array.isArray(data.dias_semana) ? data.dias_semana : [],
        horarios_curso: Array.isArray(data.horarios_curso) ? data.horarios_curso : [],
        lista_espera: Array.isArray(data.lista_espera) ? data.lista_espera : [],
        usuarios: Array.isArray(data.usuarios) ? data.usuarios : [],
      };
    }
  } catch {
    curso.value = null;
  } finally {
    cargando.value = false;
  }
};

// Lógica de PAGO (Solo si está activo)
const iniciarSuscripcion = async () => {
  if (!curso.value?.stripe_price_id) {
    $q.notify({
      type: 'negative',
      message: 'Error: Este curso no tiene ID de precio configurado.',
    });
    return;
  }
  // Llamamos a Stripe
  await handleSubscribe(curso.value.stripe_price_id, curso.value.id!.toString());
};

// Lógica de LISTA DE ESPERA (Guest)
const confirmarReservaGuest = () => {
  if (!formGuestValido.value)
    return $q.notify({ type: 'warning', message: 'Rellena todos los campos' });
  dialogGuestConfirm.value = true;
};

const reservarGuest = async () => {
  if (!curso.value || !formGuest.value.email) return;
  dialogGuestConfirm.value = false;
  reservando.value = true;
  try {
    const lista = new Set([...(curso.value.lista_espera || [])]);
    lista.add(formGuest.value.email);
    await supabase
      .from('cursos_grupales')
      .update({ lista_espera: Array.from(lista) })
      .eq('id', curso.value.id);
    $q.notify({ type: 'positive', message: 'Te avisaremos por correo.' });
    await cargarCurso();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar.' });
  } finally {
    reservando.value = false;
  }
};

// Lógica de LISTA DE ESPERA (Autenticado)
const confirmarReservaAutenticado = () => {
  if (!aceptaCondiciones.value)
    return $q.notify({ type: 'warning', message: 'Acepta las condiciones' });
  dialogConfirm.value = true;
};

const reservarAutenticado = async () => {
  if (!curso.value || !user.value) return;
  dialogConfirm.value = false;
  reservando.value = true;
  try {
    const lista = new Set([...(curso.value.lista_espera || [])]);
    lista.add(user.value.id);
    await supabase
      .from('cursos_grupales')
      .update({ lista_espera: Array.from(lista) })
      .eq('id', curso.value.id);
    $q.notify({ type: 'positive', message: 'Añadido a lista de espera.' });
    await cargarCurso();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar.' });
  } finally {
    reservando.value = false;
  }
};

onMounted(async () => {
  await cargarUsuario();
  await cargarCurso();
});
</script>

<style scoped>
.reservas-page {
  max-width: 1300px;
  margin: 0 auto;
}
</style>
