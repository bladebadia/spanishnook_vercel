<template>
  <q-page>
    <!-- Sección introductoria -->
    <div class="row q-my-xl flex flex-center">
      <div class="col-12 text-center content-width">
        <p class="titulo-responsivo" style="color: #77b308ed; margin-bottom: 1rem">
          {{ t('SobreSpanish.conoce') }}
        </p>
      </div>
      <!-- Descripción  -->
      <div class="col-12 items-center text-center" style="width: 70%">
        <p class="texto-responsivo q-pb-xl q-pb-xl" v-html="t('SobreSpanish.intro')"></p>
      </div>
      <div class="col-12 text-center">
        <p class="subtitulo-responsivo text-primary q-px-xl">
          {{ t('SobreSpanish.tulug') }}
        </p>
      </div>

      <div class="col-12 text-justify q-my-md content-width">
        <p class="texto-responsivo">
          {{ t('SobreSpanish.aprender') }}
        </p>
        <div class="q-mb-md"></div>
        <p class="texto-responsivo">
          {{ t('SobreSpanish.enmedio') }}
        </p>
      </div>

      <div class="col-12 q-my-md content-width">
        <p class="subtitulo-responsivo text-primary text-center">
          {{ t('SobreSpanish.quien') }}
        </p>
      </div>
      <div class="col-12 q-my-md content-width">
        <p class="texto-responsivo">
          {{ t('SobreSpanish.soy') }}
        </p>
        <div class="q-mb-md"></div>
        <p class="texto-responsivo" v-html="t('SobreSpanish.tras')"></p>
      </div>
      <div class="q-mb-lg"></div>
      <!-- Filosofía -->
      <div class="col-12 items-center text-center">
        <p class="subtitulo-responsivo" style="color: #851319">
          {{ t('SobreSpanish.filosofía') }}
        </p>
      </div>
      <div class="col-12 text-center q-my-md content-width">
        <p class="texto-responsivo text-justify" v-html="t('SobreSpanish.mipropuesta')"></p>
      </div>
      <div class="col-12 items-center text-center q-my-md" style="width: 70%">
        <p class="subtitulo-responsivo" style="color: #851319">
          {{ t('SobreSpanish.loque') }}
        </p>
      </div>
      <div class="col-12 text-center q-my-md content-width">
        <ul class="texto-responsivo text-justify">
          <li v-html="t('SobreSpanish.cercania')"></li>
          <li v-html="t('SobreSpanish.flexibilidad')"></li>
          <li v-html="t('SobreSpanish.confianza')"></li>
        </ul>
      </div>
      <div class="q-mb-xl"></div>
      <div class="col-12 text-center q-mt-xl content-width">
        <p class="texto-responsivo" v-html="t('SobreSpanish.ojalá')"></p>
        <div class="q-mb-md"></div>
        <div class="q-mb-md"></div>
        <p class="texto-responsivo" v-html="t('SobreSpanish.espero')"></p>
      </div>
      <div class="col-12 items-center text-center q-my-xl">
        <q-btn
          color="primary"
          :label="t('indexContactanos')"
          icon="email"
          @click="$router.push('/contacto')"
        />
      </div>
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

.content-width {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 900px) {
  .content-width {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .content-width {
    width: 100%;
  }
}
</style>
