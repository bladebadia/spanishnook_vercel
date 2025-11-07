<template>
  <q-page >
      <!-- Imagen cabecera -->
      <div style="width: 100%; margin-bottom: 3%;">
        <q-img
          style="width: 100%; height: auto;"
        fit="cover" position="center"
          src="/img/estudiante_1024.jpg">        
        </q-img>
      </div>
      <!-- Titulo texto y boton -->
      <div class="column items-center text-justify "  >
        <p class=" titulo-responsivo" style="color: #851319">
          {{ t('individuales.nuestrasClases') }}
        </p>

        <p class="q-ma-md texto-responsivo" >
          {{ t('individuales.textoNuestrasClases') }}
        </p>
        <q-btn
          class="oval-btn"
          items-center
          color="primary"
          unelevated
          to="/Reservas"
      >
        {{ t('individuales.botonSeleccionaClase') }}
        </q-btn>
      </div>

      <!-- Banner promocional test nivel -->
      <div
        class="q-mt-xl q-mb-xl row degradado-fondo"
        style="min-height: 400px; width: 100%"
        >
        <div
          class="row"
          style="width: 100%; position: relative"
          >
          <div class="col-12 q-pa-none q-pa-md-lg" style="position: absolute; top: 20%; ">
            <p class="titulo-responsivo " style="color: #fffdf8">
              <strong>{{ t('indexDescubreTuPunto') }}</strong>
            </p>
            <p class="texto-responsivo" style=" color: #fffdf8">
              {{ t('indexEnSolo') }}
            </p>
            <q-btn
              color="black"
              to="/TestNivel"
              class="oval-btn q-mx-lg"
              unelevated
              >{{ t('indexHacerTest') }}</q-btn
            >
          </div>
        </div>
      </div>
   

      <div class=" promocards-container ">
        <!-- Componente 1:  -->
        <PromoCard
          :image-src="'img/45sintitulo.webp'"
          :title="t('individuales.tituloClasesA1')"
          :description="t('individuales.textoClasesA1')"
          :button-text="t('individuales.botonClasesA1')"
           button-link="/Reservas"
          />
        <!-- Componente 2:  -->
        <PromoCard
          :image-src="'img/44sintitulo.webp'"
          :title="t('individuales.tituloClasesB1')"
          :description="t('individuales.textoClasesB1')"
          :button-text="t('individuales.botonClasesB1')"
           button-link="/Reservas"
          />
        <!-- Componente 3:  -->
        <PromoCard
          :image-src="'img/48sintitulo.webp'"
          :title="t('individuales.tituloClasesConversacion')"
          :description="t('individuales.textoClasesConversacion')"
          :button-text="t('individuales.botonClasesConversacion')"
           button-link="/Reservas"
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
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
//import '../css/pages/ClasesIndividuales.css';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import OpinioneVerificadas from '../components/OpinioneVerificadas.vue';
const {  t } = useI18n();
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

</script>

<style scoped>


/* Imagen cabecera */

.img-cabecera {
  width: 100%;
  margin-bottom: 5%;
  height: auto;
}

.promocards-container {
  display: grid;
  width: 100%;
  padding: 2rem;
  gap: 2rem;
  margin: 0 auto;
  justify-content: center;
  /* Añadir estas propiedades */
  box-sizing: border-box;
  max-width: 1800px; /* Mover aquí para que aplique a todos los tamaños */
}

/* Móvil (<600px) */
@media (max-width: 599px) {
  .promocards-container {
    grid-template-columns: minmax(280px, 95%);
    padding: 1rem;
    gap: 1rem;
    width: 100%;
  }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 1023px) {
  .promocards-container {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
    width: 100%;
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .promocards-container {
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    padding: 2rem;
    gap: 2rem;
  }
}

/* Ajuste para pantallas muy grandes */
@media (min-width: 1800px) {
  .promocards-container {
    width: 90%;
  }
}

/* Asegurar que las tarjetas tengan altura mínima */
:deep(.tarjeta-onPromo1) {
  min-height: 550px; /* Altura mínima para evitar superposición */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 80px; /* Espacio para el botón */
}

/* Asegurar que la imagen tenga altura consistente */
:deep(.q-img) {
  height: 250px;
  object-fit: cover;
}

/* Ajustar el contenedor del botón */
:deep(.boton-container) {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
