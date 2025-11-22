<template>
  <q-page class="row justify-center items-center">
    <div class="col-12 col-md-8 q-ma-none q-pa-none">
      <q-card flat bordered class="">
        <!-- Título -->
        <q-card-section class="q-pa-none q-ma-none q-mt-xl">
          <p class="titulo-responsivo text-primary text-center ">Sobre Spanish Nook</p>
        </q-card-section>

        <!-- Descripción con video embebido -->
        <q-card-section class="q-pa-none q-ma-none" >
          <div class="row items-start q-pa-none q-ma-none">
            <p class="texto-responsivo q-mb-md q-pb-md">
                 {{ t('SobreSpanish.intro') }}
            <div class="col-4 ">
              <iframe
                width="100%"
                height="150"
                src="https://www.youtube.com/embed/tu_video_id"
                title="Video introductorio"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="q-mb-md"
              ></iframe>
               <iframe
                width="100%"
                height="150"
                src="https://www.youtube.com/embed/tu_video_id"
                title="Video introductorio"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="col-8">
              
              <p class="texto-responsivo q-ma-none q-md-px-xl">
                Nuestro objetivo es proporcionar un entorno de aprendizaje accesible y efectivo, adaptado a las necesidades de cada estudiante. ¡Gracias por confiar en nosotros para tu viaje de aprendizaje del español!
              </p>
            </div>
            <div class="col-12 q-my-md">
              
              <p class="texto-responsivo">
                Nuestro objetivo es proporcionar un entorno de aprendizaje accesible y efectivo, adaptado a las necesidades de cada estudiante. ¡Gracias por confiar en nosotros para tu viaje de aprendizaje del español!
              </p>
            </div>
          </div>
        </q-card-section>

        <!-- Sección de objetivos -->
        <q-card-section class="q-ma-none q-pa-none">
          <p class="subtitulo-responsivo text-primary  q-pl-xl">Nuestros Objetivos</p>
          <ul style="margin-left: 40px;" class="texto-responsivo">
            <li>Proporcionar recursos accesibles para aprender español.</li>
            <li>Ofrecer clases personalizadas adaptadas a cada estudiante.</li>
            <li >Crear un entorno de aprendizaje efectivo y motivador.</li>
          </ul>
        </q-card-section>

        <!-- Sección de sellos de confianza -->
        <q-card-section>
          <p class="subtitulo-responsivo text-primary q-ml-xl q-pl-xl">Sellos de Confianza</p>
          <div class="row justify-around">
            <q-img
              src="/public/img/sello1.png"
              alt="Sello de confianza 1"
              style="max-width: 100px;"
            />
            <q-img
              src="/public/img/sello2.png"
              alt="Sello de confianza 2"
              style="max-width: 100px;"
            />
            <q-img
              src="/public/img/sello3.png"
              alt="Sello de confianza 3"
              style="max-width: 100px;"
            />
          </div>
        </q-card-section>

        <!-- Botón de contacto -->
        <q-card-section class="text-center q-my-xl">
          <q-btn
            color="primary"
            label="Contáctanos"
            icon="email"
            @click="$router.push('/contacto')"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// No se requiere lógica adicional para esta página estática
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>