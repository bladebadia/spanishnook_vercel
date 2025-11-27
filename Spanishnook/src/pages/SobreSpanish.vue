<template>
  <q-page class="row justify-center items-center">

    <!-- Título -->
    <div class="col-12 col-md-8 q-ma-none q-pa-none">
      <q-card flat bordered>
        <q-card-section class="q-pa-none q-ma-none q-mt-xl">
          <p class="titulo-responsivo text-primary text-center">
            {{ t('SobreSpanish.conoce') }}
          </p>
        </q-card-section>
      </q-card>
    </div>

    <!-- Sección introductoria -->
    <div class="items-center text-center q-my-xl">

      <p class="titulo-responsivo" style="color: #77b308ed">
        {{ t('SobreSpanish.conoce') }}
      </p>

      <!-- Descripción con video embebido -->
      <q-card-section class="q-pa-none q-ma-none">
        <div class="row items-start q-pa-none q-ma-none">

          <div class="col-12">
            <p class="texto-responsivo q-mb-md q-pb-md">
              {{ t('SobreSpanish.intro') }}
            </p>
          </div>

          <div class="col-4">
            <iframe
              width="100%"
              height="150"
              src="https://www.youtube.com/embed/tu_video_id"
              title="¡Hola!"
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
              {{ t('SobreSpanish.tulug') }}
            </p>
          </div>

          <div class="col-12 q-my-md">
            <p class="texto-responsivo">
              {{ t('SobreSpanish.aprender') }}
            </p>
          </div>

        </div>
      </q-card-section>

      <q-card-section>
        <div>
          <p class="texto-responsivo">
            {{ t('SobreSpanish.enmedio') }}
          </p>
        </div>
      </q-card-section>

      <!-- Sección de objetivos -->
      <q-card-section class="q-ma-none q-pa-none">
        <p class="subtitulo-responsivo text-primary q-pl-xl">
          {{ t('SobreSpanish.quien') }}
        </p>

        <ul class="texto-responsivo" style="margin-left: 40px;">
          <li>{{ t('SobreSpanish.soy') }}</li>
          <li>{{ t('SobreSpanish.tras') }}</li>
        </ul>
      </q-card-section>
    </div>

    <!-- Filosofía -->
    <div class="items-center text-center q-my-xl">
      <p class="titulo-responsivo" style="color: #851319">
        {{ t('SobreSpanish.filosofia') }}
      </p>

      <q-card-section class="q-ma-none q-pa-none">
        <p class="subtitulo-responsivo text-primary q-pl-xl">
          {{ t('SobreSpanish.mipropuesta') }}
        </p>

        <ul class="texto-responsivo" style="margin-left: 40px;">
          <li>{{ t('SobreSpanish.loque') }}</li>
          <li>{{ t('SobreSpanish.cercania') }}</li>
          <li>{{ t('SobreSpanish.flexibilidad') }}</li>
          <li>{{ t('SobreSpanish.confianza') }}</li>
        </ul>
      </q-card-section>

      <q-card>
        <!-- Botón de contacto -->
        <q-card-section class="text-center q-my-xl">
          <p>{{ t('SobreSpanish.ojalá') }}</p>
          <p>{{ t('SobreSpanish.espero') }}</p>
          <p>{{ t('SobreSpanish.proximo') }}</p>

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
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
