<template>
  <q-page class="q-pa-lg">
    <p class="subtitulo-responsivo text-primary text-center q-mb-lg">📬 Contacta con nosotros</p>
    <q-card flat bordered class="q-pa-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Columna de datos de contacto -->
          <div class="col-12 col-md-6">
            <div class="q-pa-md">
              <h5 class="text-primary">Datos de Contacto</h5>
              <p class="text-body1">
                <strong>Teléfono:</strong> +34 123 456 789
              </p>
              <p class="text-body1">
                <strong>Email:</strong> contacto@spanishnook.com
              </p>
              <p class="text-body1">
                <strong>Redes Sociales:</strong>
              </p>
              <ul>
                <li>
                  <a href="https://facebook.com/spanishnook" target="_blank" class="text-primary">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/spanishnook" target="_blank" class="text-primary">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com/spanishnook" target="_blank" class="text-primary">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Columna del formulario -->
          <div class="col-12 col-md-6">
            <q-form @submit="onSubmit" class="q-gutter-md formulario-con-relieve">
              <!-- Campo de Nombre -->
              <q-input
                filled
                v-model="formData.nombre"
                label="Nombre"
                hint="Introduce tu nombre completo"
                :rules="[val => !!val || 'El nombre es obligatorio']"
              />

              <!-- Campo de Correo Electrónico -->
              <q-input
                filled
                v-model="formData.email"
                label="Correo Electrónico"
                type="email"
                hint="Introduce tu correo electrónico"
                :rules="[val => !!val || 'El correo es obligatorio', val => /.+@.+\..+/.test(val) || 'Correo inválido']"
              />

              <!-- Campo de Asunto -->
              <q-input
                filled
                v-model="formData.asunto"
                label="Asunto"
                hint="Introduce el asunto del mensaje"
                :rules="[val => !!val || 'El asunto es obligatorio']"
              />

              <!-- Campo de Mensaje -->
              <q-input
                filled
                v-model="formData.mensaje"
                label="Mensaje"
                type="textarea"
                autogrow
                hint="Escribe tu mensaje aquí"
                :rules="[val => !!val || 'El mensaje es obligatorio']"
              />

              <!-- Botón de Enviar -->
              <div class="text-center q-mt-md">
                <q-btn
                  label="Enviar"
                  color="primary"
                  type="submit"
                  :disable="isSubmitting"
                  :loading="isSubmitting"
                />
              </div>
            </q-form>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '../css/pages/EstilosGenerales.css';

// Datos del formulario
const formData = ref({
  nombre: '',
  email: '',
  asunto: '',
  mensaje: '',
});

// Estado de envío
const isSubmitting = ref(false);

// Función para manejar el envío del formulario
const onSubmit = () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  // Simulación de envío (puedes reemplazarlo con una llamada a una API)
  setTimeout(() => {
    alert('Formulario enviado con éxito');
    isSubmitting.value = false;

    // Reiniciar el formulario
    formData.value = {
      nombre: '',
      email: '',
      asunto: '',
      mensaje: '',
    };
  }, 2000);
};
</script>

<style scoped>
.text-center {
  text-align: center;
}

/* Estilo para el formulario */
.formulario-con-relieve {
  border: 2px solid var(--q-primary); /* Marco del color primario */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Relieve */
  padding: 16px; /* Espaciado interno */
  background-color: #fff; /* Fondo blanco */
}
</style>