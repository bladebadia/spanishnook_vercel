<template>
  <q-page>
    <!-- Banner principal OK-->
    <div >
      <q-img style="width: 100%; max-height: 600px;" 
        fit="cover" position="center" src="/img/banner_1920.jpg"
         >        
      </q-img>
    </div>
    <!-- Sección introductoria OK-->
    <div class="items-center text-center q-my-xl " >
      <p class=" titulo-responsivo" style="color: #851319">
       {{ t('indexeUnLugarDonde') }}
      </p>

      <p class=" texto-responsivo text-justify" style="margin-left:13%;margin-right: 13%;" >
        {{ t('indexAprenderEspañolPuede') }}
      </p>
      <q-btn
        class="oval-btn"
        items-center
        color="primary"
        unelevated
        to="/ClasesIndividuales"
      >
        {{ t('indexCreaTuEspacio') }}
      </q-btn>
    </div>
    <!--Tarjeta descubre nuestras clases y lista OK-->
    <div
      v-intersect="onPromoIntersect"
      class="row justify-center q-my-xl">
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div v-if="showPromoCard" class="row align-center" >
        <div class="col-12 col-md-6 items-center flex flex-center column ">           
            <q-card class="" style="width: 80%;" >
              <img src="img/Home/tarjeta1_descubre_nuestras_clases.png"
                fit="cover"
                style="width: 50%; height: auto;max-height: 300px; display: block; margin: 0 auto;"/>
              <q-card-section class="subtitulo-responsivo text-center"
                >{{ t('indexDescubreNuestrasClases') }}</q-card-section
              >
              <q-card-section class="texto-responsivo text-justify">
                {{t('indexDescubreNuestrasClasesTexto')}}
              </q-card-section>
              <q-card-actions class="flex justify-center">
                <q-btn
                  color="primary"
                  to="/Clases"
                  unelevated
                  class="cuadrado-btn "
                >
                  {{ t('indexEncuentraTusClases') }}
                </q-btn>
              </q-card-actions>
            </q-card>
        </div>
        <div class="col-12 col-md-6  q-pa-md">
            <p class="subtitulo-responsivo">{{t('indexQueEncontraras')}}</p>
            <ul class=" lista-check">
              <li class="q-py-sm q-py-md-md">{{t('indexclasesEnVivo')}}</li>
              <li class="q-py-sm q-py-md-md">{{t('indexdiferentesModalidades')}}</li>
              <li class="q-py-sm q-py-md-md">{{t('indexseguimientoContinuo')}}</li>
              <li class="q-py-sm q-py-md-md">{{t('indexClasesAdaptadas')}}</li>
              <li class="q-py-sm q-py-md-md">{{t('indexMaterialesExclusivos')}}</li>
              <li class="q-py-sm q-py-md-md">{{t('indexAmbienteRelajado')}}</li>
            </ul>
        </div>
        </div>
      </transition>
    </div>
    <!-- Tarjetas de promoción de clases OK -->
    <div
      v-intersect="onPromoIntersect1"
      class="q-my-xs row justify-center bg-grey-2"      
    >
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div
          v-if="showPromoCard1"
          class="row"
          enter-active-class="animated fadeInUpBig slower "
        >
          <div class="col-12 items-center flex flex-center column q-my-md q-mb-md-xl">
            <p
              class="titulo-responsivo text-center q-mb-md"
              text-color="#851319"
            >
              {{t('indexDiferentesCaminos')}}
            </p>

            <p class="texto-responsivo text-center">
              {{t('indexAprendeEnDirecto')}}
            </p>
          </div>
          <q-separator class="q-my-xl" />

          <div class="col-12 promocards-container  ">
            <!-- Componente 1: Clases Privadas -->
            <PromoCard
              :image-src="'img/Home/tarjeta2_clases_privadas.svg'"
              :title="t('indexClasesPrivadas')"
              :description="t('indexAvanzaEnTu')"
              :button-text="t('indexQuieroMiClase')"
              :to="{ path: '/Clases', hash: '#clases-individuales' }"
              
            />
            <!-- Componente 2: Clases Grupales -->
            <PromoCard
              :image-src="'img/Home/tarjeta3_clases_grupales.svg'"
              :title="t('indexClasesGrupales')"
              :description="t('indexAprendeEspañol')"
              :button-text="t('indexAprenderEnGrupo')"
              :to="{ path: '/Clases', hash: '#clases-conversacion' }"
            />
            <!-- Componente 3: Clases de Conversación -->
            <PromoCard
              :image-src="'img/Home/tarjeta4_conversacion.svg'"
              :title="t('indexClasesDeConversacion')"
              :description="t('indexMejoraTuConfianza')"
              :button-text="t('indexUneteALaLista')"
              :to="{ path: '/Clases', hash: '#clases-conversacion' }"
            />     
                  
          </div>
        </div>
      </transition>
    </div>
      <!-- Banner promocional test nivel que aparece al hacer scroll OK-->
      <div
        v-intersect="onPromoIntersect2"
        class="q-mt-xl q-mb-xl row degradado-fondo"
        style="min-height: 300px; width: 100%"
        >
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div
          v-if="showPromoCard2"
          class="row"
          style="width: 100%; position: relative"
          enter-active-class="animated fadeInUpBig slower "
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
      </transition>
      </div>
      <!-- Tarjeta sobre quién hay detrás de Spanishnook OK-->
      <div v-intersect="onPromoIntersect4" class="q-mt-xl q-mb-xl row flex flex-center">
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div
          v-if="showPromoCard4"
          class="row justify-center "
          enter-active-class="animated fadeInUpBig slower "
        >
          <q-card class=" items-center tarjeta-quien" >
            <q-item>
              <q-item-section avatar>
                <q-avatar >
                  <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
                </q-avatar>
              </q-item-section>
              <q-item-label
                class="subtitulo-responsivo q-pa-md q-ma-md-lg text-bold "
              >
                {{t('indexQuienHayDetras')}}
              </q-item-label>
            </q-item>
            <q-separator />
            <q-item class="flex flex-justify q-pa-md">
              <q-item-label class="text-justify texto-responsivo" style="width: 100%">
                {{t('indexDetrasDeSpanishnook')}}
              </q-item-label>
            </q-item>
            <q-card-actions class="flex flex-center">
              <q-btn
                color="primary"
                to="/SobreSpanish"
                size="lg"
                unelevated
                class="cuadrado-btn " style="font-size:1rem;"
                >{{t('indexMasSobreSpanishnook')}}</q-btn
              >
            </q-card-actions>
          </q-card>
        </div>
      </transition>
      </div>
      <!-- Sección de Opiniones Verificadas - CARRUSEL -->
      <div v-intersect="onOpinionesIntersect" class="q-my-xl opiniones-section bg-grey-1">
      <transition enter-active-class="animated fadeInUpBig slower">
        <div v-if="showOpiniones" class="q-py-xl q-px-md">
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
                      :show-avatar="false"
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
      </transition>
      </div>

      <!-- Sección de FAQs -->
      <div class="q-my-xl faqs-section">
        <p class="subtitulo-responsivo " style="margin-bottom: 40px;">{{t('indexPreguntasFrecuentes')}}</p>
        <q-expansion-item class=" q-mb-md "  expand-separator>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
            </q-item-section>
            <p class="subtitulo2-responsivo q-pt-xs" >{{t('indexComoFuncionanClases')}}</p>
          </template>
          <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{t('indexTodasClasesEnVivo')}}
          </div>
        </q-expansion-item>

        <q-expansion-item class=" q-mb-md" expand-separator>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
            </q-item-section>
            <p class="subtitulo2-responsivo q-pt-xs">{{t('indexQueNecesitoParaEmpezar')}}</p>
          </template>
          <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{t('indexSoloNecesito')}}
          </div>
        </q-expansion-item>

        <q-expansion-item class=" q-mb-md" expand-separator>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
            </q-item-section>
            <p class="subtitulo2-responsivo q-pt-xs">{{t('indexPuedoCambiarDeModalidad')}}</p>
          </template>
          <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
            {{t('indexClaroQueremos')}}
          </div>
        </q-expansion-item>

        <q-expansion-item class=" q-mb-md" expand-separator>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
            </q-item-section>
            <p class="subtitulo2-responsivo q-pt-xs">{{t('indexQueNivelDeEspañol')}}</p>
          </template>
          <div class="texto2-responsivo text-justify q-px-xl q-mx-md" >
            {{t('indexNoNecesitoNingun')}}
          </div>
        </q-expansion-item>

        <q-expansion-item class=" q-mb-md" expand-separator>
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="help" color="primary" text-color="white"  />
            </q-item-section>
            <p class="subtitulo2-responsivo q-pt-xs">{{t('indexQuePasaSiNoPuedoAsistir')}}</p>
          </template>
          <div class="texto2-responsivo text-justify q-px-xl q-mx-md" >
            {{t('indexDependeraDeLaModalidad')}}
          </div>
        </q-expansion-item>
      </div>

      <!-- Sección de Contacto -->
      <div class="q-my-xl contacto-section flex flex-center column items-center">
        <p class="titulo-responsivo" style="color: #851319">{{t('indexAunTienesDudas')}}</p>
        <p class="texto-responsivo" >
        {{t('indexEstamosAlOtroLado')}}
      </p>
      <q-btn
        color="primary"
        size="lg"
        unelevated
        to="/Contacto"
        class="oval-btn "
      >
        {{t('indexContactanos')}}
      </q-btn>
      </div>
    <div class="q-my-xl"></div>
  </q-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  // Importar los estilos CSS
  import '../css/pages/IndexPage.css';
  import '../css/pages/EstilosGenerales.css';
  import PromoCard from '../components/PromoCard.vue';
  import OpinioneVerificadas from '../components/OpinioneVerificadas.vue';

  const showPromoCard = ref(false);
  const showPromoCard1 = ref(false);
  const showPromoCard2 = ref(false);
  const showOpiniones = ref(false);
  const showPromoCard4 = ref(false);
  const currentSlide = ref(0);
  const {  t } = useI18n();

  
  // Datos de las opiniones
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


function onPromoIntersect(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard.value = true;
  }
  return true;
}

function onPromoIntersect1(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard1.value = true;
  }
  return true;
}

function onPromoIntersect2(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard2.value = true;
  }
  return true;
}

function onPromoIntersect4(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard4.value = true;
  }
  return true;
}

function onOpinionesIntersect(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showOpiniones.value = true;
  }
  return true;
}

</script>

<style>

</style>
