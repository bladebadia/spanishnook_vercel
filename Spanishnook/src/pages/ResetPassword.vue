<template>
  <q-page class="q-pa-md column items-center justify-center">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 90vw">
      <q-card-section class="text-h6 text-center"> Restablecer contraseña </q-card-section>

      <q-card-section>
        <q-input
          filled
          v-model="nuevaPassword"
          label="Nueva contraseña"
          :type="mostrarPassword ? 'text' : 'password'"
          dense
          @update:model-value="serverPasswordError = ''"
          :error="(passwordError && mostrarErrores) || !!serverPasswordError"
          :hide-bottom-space="(!passwordError || !mostrarErrores) && !serverPasswordError"
          :error-message="obtenerMensajeErrorPassword"
        >
          <template v-slot:append>
            <q-icon
              :name="mostrarPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarPassword = !mostrarPassword"
            />
          </template>
        </q-input>

        <q-input
          filled
          v-model="confirmarPassword"
          label="Confirmar nueva contraseña"
          type="password"
          class="q-mt-md"
          dense
          :error="confirmarError && mostrarErrores"
          :hide-bottom-space="!confirmarError || !mostrarErrores"
          :error-message="confirmarError && mostrarErrores ? 'Las contraseñas no coinciden' : ''"
        />

        <q-banner v-if="errorMessage" class="bg-negative text-white q-mt-md rounded-borders">
          <template v-slot:avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Restablecer contraseña"
          color="primary"
          @click="resetPassword"
          :loading="loading"
          :disable="!nuevaPassword || !confirmarPassword"
        />
      </q-card-actions>

      <q-card-section v-if="success" class="text-positive text-center text-weight-bold">
        ✅ Contraseña restablecida correctamente. <br />
        Redirigiendo...
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from 'src/supabaseClient';

const router = useRouter();
const nuevaPassword = ref('');
const confirmarPassword = ref('');
const mostrarPassword = ref(false);
const loading = ref(false);

// Errores
const errorMessage = ref(''); // Error genérico (Banner)
const serverPasswordError = ref(''); // Error específico del input (Estilo nativo)
const success = ref(false);
const mostrarErrores = ref(false);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const passwordValida = computed(() => passwordRegex.test(nuevaPassword.value));

const passwordError = computed(() => !passwordValida.value);
const confirmarError = computed(() => confirmarPassword.value !== nuevaPassword.value);

// Computed para decidir qué mensaje mostrar en el input de contraseña
const obtenerMensajeErrorPassword = computed(() => {
  if (passwordError.value && mostrarErrores.value) {
    return 'Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo';
  }
  if (serverPasswordError.value) {
    return serverPasswordError.value;
  }
  return '';
});

onMounted(() => {
  // Verificar sesión
});

const resetPassword = async () => {
  mostrarErrores.value = true;
  errorMessage.value = '';
  serverPasswordError.value = ''; // Limpiamos errores previos del input

  if (!passwordValida.value || confirmarPassword.value !== nuevaPassword.value) {
    return;
  }

  loading.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword.value,
    });

    if (error) throw error;

    success.value = true;
    setTimeout(() => {
      void router.push('/Acceder');
    }, 2000);
  } catch (error: unknown) {
    console.error('Error restableciendo contraseña:', error);

    let msg = 'Error al restablecer la contraseña';
    if (error instanceof Error) msg = error.message;

    // LÓGICA DE ESTILOS:
    if (msg.includes('different from the old password')) {
      // Si es el error de "misma contraseña", lo mandamos al INPUT
      serverPasswordError.value = 'La nueva contraseña no puede ser igual a la anterior.';
    } else {
      // Cualquier otro error raro, lo mandamos al BANNER general
      errorMessage.value = msg;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.q-mt-md {
  margin-top: 16px;
}
</style>
