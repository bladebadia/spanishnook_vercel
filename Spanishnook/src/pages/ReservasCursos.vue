<template>
  <q-page class="q-pa-lg reservas-page">
    <div v-if="cargando" class="flex flex-center q-my-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <!-- Curso no encontrado -->
    <div v-else-if="!curso">
      <q-card flat bordered class="q-pa-xl text-center">
        <q-icon name="error_outline" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">Curso no encontrado</div>
        <div class="text-caption q-mt-sm">Verifica el enlace o vuelve atrás.</div>
        <q-btn color="primary" class="q-mt-md" :to="rutaClases" label="Volver a cursos" />
      </q-card>
    </div>

    <!-- Detalles del curso y reserva -->
    <div v-else class="row q-col-gutter-lg">
      <!-- Info curso (sin imagen, sin promo, sin código, sin capacidad) -->
      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5 text-weight-bold">{{ curso.nombre_curso }}</div>
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

            <!-- Mostrar nivel y precio dentro de la descripción -->
            <div class="text-body2 q-mt-sm">
              <div v-if="curso.nivel">Nivel: {{ curso.nivel }}</div>
              <div v-if="curso.precio_curso">Precio del curso: {{ curso.precio_curso }}</div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-12 col-md-6">
                <q-list dense bordered class="rounded-borders">
                  <q-item-label header>Días de la semana</q-item-label>
                  <q-item v-for="d in curso.dias_semana" :key="d">
                    <q-item-section avatar><q-icon name="event" /></q-item-section>
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
                    <q-item-section avatar><q-icon name="schedule" /></q-item-section>
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

      <!-- Reserva -->
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Reserva tu plaza</div>
            <div v-if="autenticado" class="text-caption text-grey-7">
              Estás autenticado. Puedes reservar directamente.
            </div>
            <div v-else class="text-caption text-grey-7">
              No has iniciado sesión. Puedes registrarte o reservar con tu email.
            </div>
          </q-card-section>

          <q-separator />

          <!-- Autenticado -->
          <q-card-section v-if="autenticado">
            <q-checkbox
              v-model="aceptaCondiciones"
              label="Acepto las condiciones y la política de privacidad"
            />
            <q-btn
              class="q-mt-md"
              color="primary"
              icon="event_available"
              :disable="!aceptaCondiciones"
              :loading="reservando"
              label="Reservar plaza"
              @click="confirmarReservaAutenticado"
            />
            <q-banner
              v-if="yaEnListaEspera"
              dense
              class="bg-orange-1 text-orange-9 q-mt-sm"
            >
              Ya estás en lista de espera o reserva registrada para este curso.
            </q-banner>
          </q-card-section>

          <!-- Invitado -->
          <q-card-section v-else>
            <q-input
              v-model="formGuest.nombre"
              label="Tu nombre"
              dense
              filled
              class="q-mb-sm"
              :rules="[val => !!val || 'Requerido']"
            />
            <q-input
              v-model="formGuest.email"
              label="Tu email"
              dense
              filled
              class="q-mb-sm"
              :rules="[val => !!val || 'Requerido']"
              type="email"
            />
            <q-checkbox
              v-model="aceptaCondicionesGuest"
              label="Acepto las condiciones y la política de privacidad"
              class="q-mb-md"
            />
            <q-btn
              color="primary"
              class="full-width"
              icon="event_available"
              :disable="!formGuestValido || reservando"
              :loading="reservando"
              label="Reservar con email"
              @click="confirmarReservaGuest"
            />
            <q-btn
              flat
              color="secondary"
              class="full-width q-mt-sm"
              icon="login"
              label="Registrarme / Iniciar sesión"
              :to="rutaLogin"
            />
            <q-banner
              v-if="yaEnListaEspera"
              dense
              class="bg-orange-1 text-orange-9 q-mt-sm"
            >
              Tu email ya está registrado para este curso.
            </q-banner>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-caption text-grey-6">
              Al reservar aceptas nuestras condiciones y tratamiento de datos. Te avisaremos por
              correo si la reserva se valida.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Confirmaciones -->
    <q-dialog v-model="dialogConfirm" persistent>
      <q-card style="max-width: 420px">
        <q-card-section>
          <div class="text-h6">Confirmar reserva</div>
          <div class="text-body2 q-mt-sm">
            ¿Deseas confirmar tu reserva para
            <strong>{{ curso?.nombre_curso }}</strong>?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="primary" label="Confirmar" :loading="reservando" @click="reservarAutenticado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGuestConfirm" persistent>
      <q-card style="max-width: 420px">
        <q-card-section>
          <div class="text-h6">Confirmar reserva</div>
          <div class="text-body2 q-mt-sm">
            ¿Confirmas la reserva con el email
            <strong>{{ formGuest.email }}</strong>?
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

interface CursoGrupal {
  id?: number;
  codigo_curso: string;
  nombre_curso: string;
  estado_curso: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  horarios_curso?: string[];
  dias_semana?: string[];
  descripcion?: string;
  usuarios?: string[];
  lista_espera?: string[];        // ids o emails de TODAS las reservas
  imagen_tarjeta?: string;
  titulo_tarjeta?: string;
  boton_tarjeta?: string;
  texto_tarjeta?: string;
  nivel?: string;
  max_estudiantes?: number;
  precio_curso?: string;
  precio_original?: string;
  mostrar_promo?: boolean;
  texto_promo?: string;
  mostrar_precio?: boolean;
  visibilidad?: boolean;
}

const $q = useQuasar();
const route = useRoute();

const curso = ref<CursoGrupal | null>(null);
const cargando = ref<boolean>(true);
const reservando = ref<boolean>(false);

const user = ref<User | null>(null);
const autenticado = computed(() => !!user.value);

const aceptaCondiciones = ref<boolean>(false);
const aceptaCondicionesGuest = ref<boolean>(false);

const dialogConfirm = ref<boolean>(false);
const dialogGuestConfirm = ref<boolean>(false);

const formGuest = ref<{ nombre: string; email: string }>({
  nombre: '',
  email: '',
});

const rutaClases = '/NuestrasClases';
const rutaLogin = '/Login';

const formGuestValido = computed(
  () => !!formGuest.value.nombre && !!formGuest.value.email && aceptaCondicionesGuest.value,
);

const yaEnListaEspera = computed(() => {
  if (!curso.value) return false;
  const valor = user.value?.id || formGuest.value.email || '';
  return valor ? (curso.value.lista_espera || []).includes(valor) : false;
});

const colorEstado = computed(() => {
  switch (curso.value?.estado_curso) {
    case 'Activo': return 'positive';
    case 'En reserva': return 'orange';
    case 'Completo': return 'blue';
    case 'Finalizado': return 'grey';
    default: return 'primary';
  }
});

const cargarUsuario = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    user.value = data.user;
  } catch {
    // noop
  }
};

const cargarCurso = async (): Promise<void> => {
  cargando.value = true;
  try {
    const idParam = route.params.id || route.query.id;
    const idNum = Number(idParam);
    if (!idParam || isNaN(idNum)) {
      curso.value = null;
      return;
    }

    const { data, error } = await supabase
      .from('cursos_grupales')
      .select('*')
      .eq('id', idNum)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      curso.value = null;
      return;
    }

    curso.value = {
      ...data,
      dias_semana: Array.isArray(data.dias_semana) ? data.dias_semana : data.dias_semana ? [data.dias_semana] : [],
      horarios_curso: Array.isArray(data.horarios_curso) ? data.horarios_curso : data.horarios_curso ? [data.horarios_curso] : [],
      usuarios: Array.isArray(data.usuarios) ? data.usuarios : data.usuarios ? [data.usuarios] : [],
      lista_espera: Array.isArray(data.lista_espera) ? data.lista_espera : data.lista_espera ? [data.lista_espera] : [],
    };
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando curso' });
    curso.value = null;
  } finally {
    cargando.value = false;
  }
};

const confirmarReservaAutenticado = () => {
  if (!aceptaCondiciones.value) {
    $q.notify({ type: 'warning', message: 'Debes aceptar las condiciones' });
    return;
  }
  dialogConfirm.value = true;
};

const reservarAutenticado = async (): Promise<void> => {
  if (!curso.value || !user.value) return;
  dialogConfirm.value = false;
  reservando.value = true;
  try {
    const lista = new Set([...(curso.value.lista_espera || [])]);
    lista.add(user.value.id); // guardar ID del usuario en lista_espera

    const { error } = await supabase
      .from('cursos_grupales')
      .update({ lista_espera: Array.from(lista) })
      .eq('id', curso.value.id);

    if (error) throw error;

    $q.notify({ type: 'positive', message: 'Reserva registrada' });
    await cargarCurso();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al reservar' });
  } finally {
    reservando.value = false;
  }
};

const confirmarReservaGuest = () => {
  if (!formGuestValido.value) {
    $q.notify({ type: 'warning', message: 'Completa datos y acepta condiciones' });
    return;
  }
  dialogGuestConfirm.value = true;
};

const reservarGuest = async (): Promise<void> => {
  if (!curso.value || !formGuest.value.email) return;
  dialogGuestConfirm.value = false;
  reservando.value = true;
  try {
    const lista = new Set([...(curso.value.lista_espera || [])]);
    lista.add(formGuest.value.email); // guardar email del invitado en lista_espera

    const { error } = await supabase
      .from('cursos_grupales')
      .update({ lista_espera: Array.from(lista) })
      .eq('id', curso.value.id);

    if (error) throw error;

    $q.notify({ type: 'positive', message: 'Reserva por email registrada' });
    await cargarCurso();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al reservar email' });
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
.full-width {
  width: 100%;
}
</style>