<template>
  <q-page class="q-pa-md column items-center justify-evenly">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <!-- Formulario para manejar el submit con Enter -->
      <form @submit.prevent="registrar">
        <q-card-section>
          <q-input
            filled
            v-model="nombre"
            :label="t('registro.nombreOApodo')"
            dense
            :error="false"
            :hide-bottom-space="true"
          />

          <q-input
            filled
            v-model="email"
            :label="t('registro.correoElectronico')"
            type="email"
            class="q-mt-md"
            dense
            :error="!!errorMessage"
            :error-message="errorMessage"
            :hide-bottom-space="!errorMessage"
          />

          <q-input
            filled
            v-model="password"
            :label="t('registro.contrasena')"
            :type="passwordVisible ? 'text' : 'password'"
            class="q-mt-md"
            dense
            :error="passwordError && mostrarErrores"
            :hide-bottom-space="!(passwordError && mostrarErrores)"
            :error-message="
              passwordError && mostrarErrores
                ? t('registro.laContrasenaDebe')
                : ''
            "
          >
          <template v-slot:append>
              <q-icon
                :name="passwordVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="togglePasswordVisibility"
              />
            </template>
          </q-input>
          <q-input
            filled
            v-model="confirmPassword"
            :label="t('registro.confirmarContrasena')"
            :type="confirmPasswordVisible ? 'text' : 'password'"
            class="q-mt-md"
            dense
            :error="confirmError && mostrarErrores"
            :hide-bottom-space="!(confirmError && mostrarErrores)"
            :error-message="confirmError && mostrarErrores ? t('registro.lasContrasenasNo') : ''"
          >
          <template v-slot:append>
              <q-icon
                :name="confirmPasswordVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="toggleConfirmPasswordVisibility"
              />
            </template>
          </q-input>
          <!-- Checkbox de condiciones de privacidad -->
          <div class="q-mt-md">
            <div class="row items-center no-wrap">
              <q-checkbox
                v-model="aceptoPrivacidad"
                :error="privacidadError && mostrarErrores"
                class="q-mr-sm"
              />

              <span class="text-cursor">
                {{ t('registro.aceptoLos') }}
                <router-link to="/Privacidad" class="text-primary text-weight-bold" @click.stop>
                  {{ t('registro.terminosYCondiciones') }}
                </router-link>
              </span>
            </div>

            <div
              v-if="privacidadError && mostrarErrores"
              class="text-negative text-caption q-mt-xs"
            >
              {{ t('registro.debesAceptarLos') }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :label="t('registro.registrarse')" color="primary" type="submit" :loading="loading" />
        </q-card-actions>
      </form>

      <q-card-section class="q-pt-none text-center">
        <router-link to="/Acceder" class="text-primary"> {{ t('registro.yaTengoCuenta') }} </router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserRegistro' });
import { ref, computed } from 'vue';
import { supabase } from '../supabaseClient';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const nombre = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const aceptoPrivacidad = ref(false);
const mostrarErrores = ref(false);
const errorMessage = ref('');
const loading = ref(false);
const router = useRouter();
const passwordVisible = ref(false);
const confirmPasswordVisible = ref(false);

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value;
}

function toggleConfirmPasswordVisibility() {
  confirmPasswordVisible.value = !confirmPasswordVisible.value;
}

// Regla de contraseña
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const passwordValida = computed(() => passwordRegex.test(password.value));

// Errores (solo después de intentar registrar)
const passwordError = computed(() => !passwordValida.value);
const confirmError = computed(() => confirmPassword.value !== password.value);
const privacidadError = computed(() => !aceptoPrivacidad.value);

async function registrar() {
  loading.value = true;
  mostrarErrores.value = true;
  errorMessage.value = '';

  // Validaciones básicas (incluyendo privacidad)
  if (
    !nombre.value ||
    !email.value ||
    !passwordValida.value ||
    confirmPassword.value !== password.value ||
    !aceptoPrivacidad.value
  ) {
    loading.value = false;
    return;
  }

  try {
    // Intentar el registro directamente
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: window.location.origin + '/AuthCallback',
        data: {
          nombre: nombre.value,
          acepto_privacidad: true,
          fecha_aceptacion: new Date().toISOString(),
        },
      },
    });

    if (error) {
      // Manejo de errores de Supabase Auth
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already exists') ||
        error.message.includes('already exists') ||
        error.message.includes('user already exists') ||
        error.code === 'user_already_exists'
      ) {
        errorMessage.value =
          'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
      } else {
        errorMessage.value = `Error al registrarse: ${error.message}`;
      }
      console.error('Error registrando:', error);
      loading.value = false;
      return;
    }

    console.log('Usuario registrado:', data);

    // Verificar si realmente se creó el usuario
    if (data.user && data.user.identities && data.user.identities.length > 0) {
      await router.push('/CheckEmail');
    } else {
      errorMessage.value = 'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
    }
  } catch (error) {
    console.error('Error inesperado:', error);
    errorMessage.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Opcional: mejorar el estilo del enlace dentro del checkbox */
.text-primary {
  text-decoration: underline;
}
.text-primary:hover {
  text-decoration: none;
}
</style>
