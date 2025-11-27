<template>
<q-page class="row items-center justify-evenly">
    <!-- Imagen cabecera Titulo texto  -->
    <div class="row" style="width: 100%; margin: 3%;">
      <div class="col-12 col-md-6">
          <q-img
            style="width: 100%; height: auto;"
            fit="cover" position="center"
            src="/img/estudiante_1024.jpg">        
          </q-img>
      </div>
      
      <div class="col-12 col-md-6 text-center q-pa-md align-self-center">     
        <p class=" titulo-responsivo " style="color: #851319">
          {{ t('individuales.nuestrasClases') }}
        </p>
        <p class="q-ma-md texto-responsivo text-justify" v-html="t('individuales.textoNuestrasClases')">
        </p>        
      </div>
    </div>
    <!-- Botones de Clases de conversación y Clases Individuales -->
    <div class="row q-pa-md q-my-md justify-evenly" style="width: 100%; gap: 16px;">
      <q-btn
        class="oval-btn"
        items-center
        color="primary"
        unelevated
        to="/Reservas"
      >
        Clases de conversacion
      </q-btn>

      <q-btn
        class="oval-btn"
        items-center
        color="primary"
        unelevated
        to="/Reservas"
      >
        Clases Individuales
      </q-btn>
    </div>

    <!-- Div con números ascendentes y título -->
    <div class="numeros-div  q-my-xl  flex column items-center justify-center bg-primary"
      v-intersect="onLogrosIntersect"
      style="width: 100%;">
      <p class="titulo-responsivo text-center  text-weight-bold">{{$t("grupales.uneteAEllas")}}</p>
        <div class=" flex row justify-around full-width">
          <div class="numero-item ">
            <div class="numero" style = "color: white;">{{ count1 }}</div>
            <div style="font-size: 1.8rem; color:white">{{$t("grupales.alumnos")}}</div>
          </div>
          <div class="numero-item ">
            <div class="numero " style = "color: white;">{{ count2 }}</div>
            <div style="font-size: 1.8rem; color:white">{{$t("grupales.cursos")}}</div>
          </div>
          <div class="numero-item">
            <div class="numero" style = "color: white;">{{ count3 }}</div>
            <div  style="font-size: 1.8rem; color:white">{{$t("grupales.clasesImpartidas")}}</div>
          </div>
        </div>
    </div>

    <!-- Animación: imagen que entra desde la izquierda y queda a la derecha -->
    <div class="row full-width q-my-xl">
      <div class="col-12">
        <div v-intersect="onImgIntersect" class="animacion-banner">
          <div v-if="showAnimatedImg" class="anim-group">
            <div class="test-card">
              <div class="test-card__text">Recuerda hacer tu test</div>
                <q-btn
                  class="oval-btn q-mt-sm"
                  color="black"
                  unelevated
                  to="/TestNivel"
                  label="Test de nivel"
                />
            </div>
            <img
              src="/img/animacion4.png"
              alt="Animación"
              class="anim-img"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- seccion clases grupales -->
    <!-- ...existing code... -->

    <!-- Sección clases grupales: Imagen izquierda + Banner derecho -->
    <div class="row full-width q-my-xl items-center" style="gap: 32px;">
      <!-- Imagen izquierda -->
      <div class="col-12 col-md-5 flex justify-center">
        <q-img
          src="/img/estudiantes_1024.jpg"
          style="width: 100%; max-width: 500px; border-radius: 16px;"
          fit="cover"
        />
      </div>
      
      <!-- Banner rojo derecho -->
      <div class="col-12 col-md-6 flex justify-center">
        <div class="banner-clases-grupales">
          <h2 class="banner-clases-grupales__titulo titulo-responsivo text-center">
            Clases Grupales de Conversación
          </h2>
        </div>
      </div>
    </div>



  <!-- div de servicio clases de conversación -->
  <div class="row flex q-my-xl" style="width: 100%; gap: 32px;">
    <div class="col-12 flex flex-center" >
      <q-card  class="tarjeta-formativos text-center shadow-2 bg-white text-dark ">
        <div class="titulo-responsivo  text-center">Nuestras clases de conversación</div>
          <p class=" texto-responsivo ">
            {{$t("grupales.textoNuestrosGruposFormativos")}}
          </p>
      </q-card>          
    </div>     
  </div>

  <div class=" promocards-container ">
        <!-- Componente 1:  -->
        <PromoCard
          :image-src="'img/45sintitulo.webp'"
          :title="t('individuales.tituloClasesA1')"
          :description="t('individuales.textoClasesA1')"
          :button-text="t('individuales.botonClasesA1')"
          to="/Reservas"
          />
        <!-- Componente 2:  -->
        <PromoCard
          :image-src="'img/44sintitulo.webp'"
          :title="t('individuales.tituloClasesB1')"
          :description="t('individuales.textoClasesB1')"
          :button-text="t('individuales.botonClasesB1')"
          to="/Reservas"
          />
        <!-- Componente 3:  -->
        <PromoCard
          :image-src="'img/48sintitulo.webp'"
          :title="t('individuales.tituloClasesConversacion')"
          :description="t('individuales.textoClasesConversacion')"
          :button-text="t('individuales.botonClasesConversacion')"
          to="/Reservas"
          />                   
      </div>
      <!-- Sección de Opiniones Verificadas - CARRUSEL -->
      <div  class="q-my-xl opiniones-section bg-grey-1">
        <div  class="q-py-xl q-px-md">
          <div class="text-center q-mb-xl">
            <p class="subtitulo-responsivo q-my-xl" style="color: #851319">
              {{ t('indexOpinionesVerificadas') }}
            </p>
            <p class="texto-responsivo" >
              {{ t('indexConoceExperiencias') }}
            </p>
          </div>

          <!-- Carrusel de Opiniones -->
          <div class="carousel-container">
            <q-carousel
              v-model="currentSlide"
              transition-prev="slide-right"
              transition-next="slide-left"
              swipeable
              animated
              control-color="primary"
              :autoplay="5000"
              arrows
              height="400px"
              class="opinions-carousel"
            >
              <!-- Slides del carrusel - mostrar 1 -->
              <q-carousel-slide 
                v-for="(opinion, index) in todasLasOpiniones" 
                :key="index"
                :name="index"
                class="q-pa-none"
              >
                <div class="row justify-center full-height items-center">
                  <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <OpinioneVerificadas 
                      :opinion="opinion"
                      avatar-size="80px"
                      class="single-opinion-card"
                    />
                  </div>
                </div>
              </q-carousel-slide>

              <!-- Controles personalizados -->
              <template v-slot:control>
                <q-carousel-control
                  position="bottom-right"
                  :offset="[18, 18]"
                  class="text-white rounded-borders"
                  style="background: rgba(0, 0, 0, 0.3); padding: 4px 8px;"
                >
                  <q-icon name="star" size="sm" class="q-mr-xs" />
                    {{ currentSlide + 1 }} / {{ todasLasOpiniones.length }}
                  </q-carousel-control>
              </template>

              <!-- Flechas personalizadas -->
              <template v-slot:navigation-icon="{ active, btnProps, onClick }">
                <q-btn
                  v-if="btnProps.icon === 'chevron_left'"
                  :class="{ 'text-primary': active }"
                  color="white"
                  text-color="primary"
                  :icon="btnProps.icon"
                  size="lg"
                  round
                  dense
                  :disable="btnProps.disable"
                  @click="onClick"
                  class="carousel-arrow carousel-arrow-left"
                />
                <q-btn
                  v-else-if="btnProps.icon === 'chevron_right'"
                  :class="{ 'text-primary': active }"
                  color="white"
                  text-color="primary"
                  :icon="btnProps.icon"
                  size="lg"
                  round
                  dense
                  :disable="btnProps.disable"
                  @click="onClick"
                  class="carousel-arrow carousel-arrow-right"
                />
              </template>
            </q-carousel>

            <!-- Indicadores de slide personalizados -->
            <div class="carousel-indicators q-mt-md">
              <q-btn
                v-for="(opinion, index) in todasLasOpiniones"
                :key="index"
                :class="{ 'active': currentSlide === index }"
                @click="currentSlide = index"
                round
                dense
                size="sm"
                :color="currentSlide === index ? 'primary' : 'grey-5'"
                class="q-mx-xs"
              >
                <q-tooltip :delay="500" class="bg-primary">
                  {{ opinion.name }} - {{ opinion.country }}
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Botón para ver más opiniones -->
            <div class="text-center q-mt-xl">
            <q-btn
              outline
              color="primary"
              size="lg"
              to="/Opiniones"
              class="oval-btn"
            >
              {{ t('indexVerMasOpiniones') }}
            </q-btn>
            </div>
          </div>
        </div>
      </div>

  </q-page>
</template>


<script setup lang="ts">

import { ref } from 'vue';
import type { Ref } from 'vue';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import { useI18n } from 'vue-i18n';
import OpinioneVerificadas from '../components/OpinioneVerificadas.vue';
import '../css/pages/ClasesGrupales.css';
  
    const {  t } = useI18n();
//    const mostrarBocadillo = ref(false);
    const showAnimatedImg = ref(false);
    const currentSlide = ref(0);
const todasLasOpiniones = ref([
  {
    name: 'María González',
    country: 'España',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    rating: 5,
    comment: 'Las clases con SpanishNook han sido increíbles. En solo 3 meses he mejorado mi conversación significativamente. Los profesores son muy pacientes y profesionales.',
    verified: true,
    date: '2024-09-15',
    course: 'Clases Individuales'
  },
  {
    name: 'John Smith',
    country: 'Estados Unidos',
    avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    rating: 5,
    comment: 'I love the flexibility of the classes and how personalized they are. The teachers adapt to my learning pace and help me with pronunciation. Highly recommended!',
    verified: true,
    date: '2024-08-20',
    course: 'Conversación Avanzada'
  },
  {
    name: 'Emma Laurent',
    country: 'Francia',
    avatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    rating: 5,
    comment: 'Excellent experience! The live classes are very dynamic and I finally feel confident speaking Spanish. The method is very effective.',
    verified: true,
    date: '2024-09-01',
    course: 'Español Empresarial'
  },
  {
    name: '李明',
    country: 'China',
    avatar: 'https://cdn.quasar.dev/img/avatar6.jpg',
    rating: 4,
    comment: '课程非常棒！老师很专业，教学方法很有效。我的西班牙语水平提高了很多。强烈推荐SpanishNook！',
    verified: true,
    date: '2024-08-10',
    course: 'Principiantes A1'
  },
  {
    name: 'Sophie Müller',
    country: 'Alemania',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    rating: 5,
    comment: 'Sehr gute Spanischkurse! Die Lehrer sind kompetent und geduldig. Ich kann SpanishNook nur weiterempfehlen.',
    verified: true,
    date: '2024-07-25',
    course: 'Intermedio B1'
  },
  {
    name: 'Roberto Silva',
    country: 'Brasil',
    avatar: 'https://cdn.quasar.dev/img/avatar.png',
    rating: 4,
    comment: 'Ótima plataforma para aprender espanhol. Os professores são muito qualificados e as aulas são dinâmicas.',
    verified: true,
    date: '2024-06-30',
    course: 'Clases Grupales'
  }
]);

  let animacionMostrada = false;

  function onImgIntersect(entry: IntersectionObserverEntry) {
    if (entry.isIntersecting && !animacionMostrada) {
      showAnimatedImg.value = false;
      setTimeout(() => {
        showAnimatedImg.value = true;
        animacionMostrada = true;
      }, 10);
    }
    // No ocultar la animación ni el bocadillo al salir del viewport
    return true;
  }

    // Animación de conteo ascendente para los números
    const count1 = ref(0);
    const count2 = ref(0);
    const count3 = ref(0);
    const count4 = ref(0);

    function animateCount(refVar: Ref<number, number>, target: number, duration = 1200) {
      const start = 0;
      const increment = Math.ceil(target / (duration / 20));
      let current = start;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          refVar.value = target;
          clearInterval(interval);
        } else {
          refVar.value = current;
        }
      }, 20);
    }


    let logrosAnimado = false;
    function onLogrosIntersect(entry: IntersectionObserverEntry) {
      if (entry.isIntersecting && !logrosAnimado) {
        logrosAnimado = true;
        animateCount(count1, 600);
        animateCount(count2, 240);
        animateCount(count3, 360);
        animateCount(count4, 48);
      }
      if (!entry.isIntersecting) {
        logrosAnimado = false;
        count1.value = 0;
        count2.value = 0;
        count3.value = 0;
        count4.value = 0;
      }
    }


</script>

<style>

</style>

