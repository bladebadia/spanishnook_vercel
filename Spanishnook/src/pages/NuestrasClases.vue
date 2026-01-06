<template>
  <q-page class="row items-center justify-evenly">
    <!-- Imagen cabecera Titulo texto  -->
    <div class="row" style="width: 100%">
      <div class="col-12 col-md-6">
        <q-img
          style="width: 100%; height: auto"
          fit="cover"
          position="center"
          src="/img/estudiante_1024.jpg"
        >
        </q-img>
      </div>

      <div class="col-12 col-md-6 text-center q-pa-none q-mx-none q-pa-md-md align-self-center">
        <p class="titulo-responsivo" style="color: #851319">
          {{ t('NuestrasClases.nuestrasClases') }}
        </p>
        <p
          class="texto-responsivo q-ma-none q-pa-none"
          v-html="t('NuestrasClases.textoNuestrasClases')"
        ></p>
      </div>
    </div>
    <!-- Botones de Clases de conversación y Clases Individuales -->
    <div class="row q-pa-md q-my-md justify-evenly botones-clases">
      <q-btn
        class="oval-btn"
        items-center
        color="primary"
        unelevated
        @click="scrollToSection('clases-conversacion')"
      >
        {{ t('NuestrasClases.botonClasesConversacion') }}
      </q-btn>

      <q-btn
        class="oval-btn"
        items-center
        color="primary"
        unelevated
        @click="scrollToSection('clases-individuales')"
      >
        {{ t('NuestrasClases.botonClasesIndividuales') }}
      </q-btn>
    </div>

    <!-- Div con números ascendentes y título -->
    <div
      class="numeros-div q-my-xl flex column items-center justify-center bg-primary"
      v-intersect="onLogrosIntersect"
      style="width: 100%"
      v-if="$q.screen.gt.md"
    >
      <p class="titulo-responsivo text-center text-weight-bold">
        {{ $t('NuestrasClases.uneteAEllas') }}
      </p>
      <div class="flex row justify-around full-width">
        <div class="numero-item">
          <div class="numero" style="color: white">{{ count1 }}</div>
          <div style="font-size: 1.8rem; color: white">{{ $t('NuestrasClases.alumnos') }}</div>
        </div>
        <div class="numero-item">
          <div class="numero" style="color: white">{{ count2 }}</div>
          <div style="font-size: 1.8rem; color: white">{{ $t('NuestrasClases.cursos') }}</div>
        </div>
        <div class="numero-item">
          <div class="numero" style="color: white">{{ count3 }}</div>
          <div style="font-size: 1.8rem; color: white">
            {{ $t('NuestrasClases.clasesImpartidas') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Animación: imagen que entra desde la izquierda y queda a la derecha -->
    <div class="row full-width q-my-xl">
      <div class="col-12">
        <div v-intersect="onImgIntersect" class="animacion-banner">
          <div v-if="showAnimatedImg" class="anim-group">
            <div class="test-card">
              <div class="test-card__text">{{ $t('NuestrasClases.recuerdaHacerTest') }}</div>
              <q-btn
                class="oval-btn q-mt-sm"
                color="black"
                unelevated
                to="/TestNivel"
                :label="$t('NuestrasClases.testDeNivel')"
              />
            </div>
            <img src="/img/animacion4.png" alt="Animación" class="anim-img" />
          </div>
        </div>
      </div>
    </div>

    <!-- Sección clases grupales: Imagen izquierda + Banner derecho -->
    <div
      id="clases-conversacion"
      class="row full-width q-my-xl items-center"
      style="gap: 32px; scroll-margin-top: 120px"
    >
      <!-- Imagen izquierda -->
      <div class="col-12 col-md-5 flex justify-center">
        <q-img
          src="/img/estudiantes_1024.jpg"
          style="width: 100%; max-width: 500px; border-radius: 16px"
          fit="cover"
        />
      </div>

      <!-- Banner rojo derecho -->
      <div class="col-12 col-md-6 flex justify-center">
        <div class="banner-clases-grupales">
          <h2 class="banner-clases-grupales__titulo titulo-responsivo text-center">
            {{ $t('NuestrasClases.clasesGrupalesConversacion') }}
          </h2>
        </div>
      </div>
    </div>

    <!-- div de servicio clases de conversación -->
    <div class="row flex q-my-xl" style="width: 100%; gap: 32px">
      <div class="col-12 flex flex-center">
        <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
          <div class="titulo-responsivo text-justify-center">
            {{ $t('NuestrasClases.nuestrasClasesConversacion') }}
          </div>
          <div>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.tePasaQue') }}
            </p>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.esteCursoEsParaTi') }}
            </p>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.cadaSemanaNos') }}
            </p>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.aquiHablamos') }}
            </p>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.esUnPrograma') }}
            </p>
            <p class="texto-responsivo text-justify">
              {{ $t('NuestrasClases.uneteALa') }}
            </p>
          </div>

          <q-expansion-item
            :label="$t('NuestrasClases.TextoNuestrosCursosGrupo1')"
            header-class="bg-primary text-white subtitulo-responsivo"
            class="q-my-xl"
          >
            <q-card>
              <q-card-section class="texto-responsivo text-justify">
                <ul class="q-pl-md text-justify">
                  <li v-html="$t('NuestrasClases.ListaComoFuncionanGrupos1')"></li>
                  <li v-html="$t('NuestrasClases.ListaComoFuncionanGrupos2')"></li>
                  <li v-html="$t('NuestrasClases.ListaComoFuncionanGrupos3')"></li>
                  <li v-html="$t('NuestrasClases.ListaComoFuncionanGrupos4')"></li>
                  <li v-html="$t('NuestrasClases.ListaComoFuncionanGrupos5')"></li>
                </ul>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            :label="$t('NuestrasClases.queLograras')"
            header-class="bg-primary text-white subtitulo-responsivo"
            class="q-my-lg"
          >
            <q-card>
              <q-card-section class="texto-responsivo text-justify">
                <ul class="q-pl-md">
                  <li v-html="$t('NuestrasClases.Logro1Grupales')"></li>
                  <li v-html="$t('NuestrasClases.Logro2Grupales')"></li>
                  <li v-html="$t('NuestrasClases.Logro3Grupales')"></li>
                  <li v-html="$t('NuestrasClases.Logro4Grupales')"></li>
                  <li v-html="$t('NuestrasClases.Logro5Grupales')"></li>
                  <li v-html="$t('NuestrasClases.Logro6Grupales')"></li>
                </ul>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <!-- Cursos desde Supabase -->
    <div class="promocards-container">
      <PromoCard
        v-for="curso in cursosPromo"
        :key="curso.id"
        :image-src="curso.imagen_tarjeta"
        :title="curso.titulo_tarjeta"
        :description="curso.texto_tarjeta"
        :button-text="curso.boton_tarjeta"
        :show-promo="curso.showPromo"
        :promo-text="curso.promoText"
        :show-price="curso.showPrice"
        :price="curso.price"
        :original-price="curso.originalPrice"
        :button-link="curso.buttonLink"
        :fecha-inicio="curso.fechaInicio"
      />
    </div>

    <!--Seccion clases individuales-->
    <div
      id="clases-individuales"
      class="row full-width q-my-xl items-center"
      style="gap: 32px; scroll-margin-top: 120px"
    >
      <!-- Banner rojo izquierdo -->
      <div class="col-12 col-md-6 flex justify-center">
        <div class="banner-clases-grupales">
          <h2 class="banner-clases-grupales__titulo titulo-responsivo text-center">
            {{ $t('NuestrasClases.clasesIndividualesPersonalizadas') }}
          </h2>
        </div>
      </div>

      <!-- Imagen derecha -->
      <div class="col-12 col-md-5 flex justify-center">
        <q-img
          src="/img/estudiante_1024.jpg"
          style="width: 100%; max-width: 500px; border-radius: 16px"
          fit="cover"
        />
      </div>
    </div>

    <!-- div de servicio clases individuales -->
    <div class="row flex q-my-xs" style="width: 100%; gap: 32px">
      <div class="col-12 flex flex-center">
        <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
          <q-card-section class="q-pt-lg">
            <div class="titulo-responsivo text-center">
              {{ $t('NuestrasClases.nuestrasClasesIndividuales') }}
            </div>
            <p class="texto-responsivo text-justify q-mb-none">
              {{ $t('NuestrasClases.IntroIndividuales') }}
            </p>
          </q-card-section>

          <q-separator spaced />

          <q-card-section>
            <div class="subtitulo-responsivo text-left q-mb-md">
              {{ $t('NuestrasClases.Modalidades') }}
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="modalidad-card">
                  <div class="subtitulo-responsivo text-center q-mb-sm">
                    {{ $t('NuestrasClases.Modalidad1') }}
                  </div>
                  <p class="texto-responsivo text-justify q-mb-none">
                    {{ $t('NuestrasClases.TextoModalidad1') }}
                  </p>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="modalidad-card">
                  <div class="subtitulo-responsivo text-center q-mb-sm">
                    {{ $t('NuestrasClases.Modalidad2') }}
                  </div>
                  <p class="texto-responsivo text-justify q-mb-none">
                    {{ $t('NuestrasClases.TextoModalidad2') }}
                  </p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator spaced />

          <q-card-section>
            <div class="subtitulo-responsivo text-left q-mb-md">
              {{ $t('NuestrasClases.TextoComoFuncionanIndividuales') }}
            </div>
            <ul class="texto-responsivo text-justify q-pl-md lista-funcionamiento">
              <li>{{ $t('NuestrasClases.ListaComoFuncionanInd1') }}</li>
              <li>{{ $t('NuestrasClases.ListaComoFuncionanInd2') }}</li>
              <li>{{ $t('NuestrasClases.ListaComoFuncionanInd3') }}</li>
              <li>{{ $t('NuestrasClases.ListaComoFuncionanInd4') }}</li>
              <li>{{ $t('NuestrasClases.ListaComoFuncionanInd5') }}</li>
            </ul>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tarjetas de clases individuales (puedes agregar más o cargar desde Supabase) -->
    <div class="promocards-container">
      <PromoCard
        image-src="img/45sintitulo.webp"
        :title="t('NuestrasClases.tituloClasesA1')"
        :description="t('NuestrasClases.textoClasesA1')"
        :button-text="t('NuestrasClases.botonClasesA1')"
        :show-promo="true"
        :promo-text="t('NuestrasClases.pruebaTuClaseGratis')"
        to="/Reservas"
      />
      <PromoCard
        image-src="img/44sintitulo.webp"
        :title="t('NuestrasClases.tituloClasesB1')"
        :description="t('NuestrasClases.textoClasesB1')"
        :button-text="t('NuestrasClases.botonClasesB1')"
        :show-promo="true"
        :promo-text="t('NuestrasClases.pruebaTuClaseGratis')"
        to="/Reservas"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import type { Ref } from 'vue';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import { useI18n } from 'vue-i18n';
import '../css/pages/ClasesGrupales.css';
import { supabase } from 'src/supabaseClient';
import { useRoute } from 'vue-router';
import { scroll, useMeta } from 'quasar';

const route = useRoute();
const { getScrollTarget, setVerticalScrollPosition } = scroll;
const { t } = useI18n();

const pageTitle = 'Clases particulares y grupales de español online | SpanishNook';
const pageDescription =
  'Reserva clases particulares 1:1 y grupales de conversación en vivo con SpanishNook. Profesores nativos, grupos reducidos y horarios flexibles para avanzar en tu español.';
const pageUrl = 'https://spanishnook.com/NuestrasClases';
const pageImage = 'https://spanishnook.com/img/estudiante_1024.jpg';

useMeta(() => ({
  title: pageTitle,
  meta: {
    description: { name: 'description', content: pageDescription },
    keywords: {
      name: 'keywords',
      content:
        'clases particulares español online, clases grupales español, clases conversación, profesor nativo español, grupos reducidos, clases 1 a 1',
    },
    ogTitle: { property: 'og:title', content: pageTitle },
    ogDescription: { property: 'og:description', content: pageDescription },
    ogImage: { property: 'og:image', content: pageImage },
    ogUrl: { property: 'og:url', content: pageUrl },
    ogType: { property: 'og:type', content: 'website' },
    twitterCard: { name: 'twitter:card', content: 'summary_large_image' },
    twitterTitle: { name: 'twitter:title', content: pageTitle },
    twitterDescription: { name: 'twitter:description', content: pageDescription },
    twitterImage: { name: 'twitter:image', content: pageImage },
  },
}));
const showAnimatedImg = ref(false);

function scrollDirecto(hash: string, offset = 80) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  const target = getScrollTarget(el);
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  setVerticalScrollPosition(target, top, 0); // 0ms = instantáneo
}

const cursosPromo = ref<
  Array<{
    id: number;
    imagen_tarjeta: string;
    titulo_tarjeta: string;
    texto_tarjeta: string;
    boton_tarjeta: string;
    showPromo: boolean;
    promoText: string;
    showPrice: boolean;
    price: string;
    originalPrice: string;
    buttonLink: string;
    fechaInicio: string;
  }>
>([]);

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
async function cargarCursosPromo(): Promise<void> {
  const { data, error } = await supabase
    .from('cursos_grupales')
    .select(
      `
      id, 
      imagen_tarjeta, 
      titulo_tarjeta, 
      texto_tarjeta, 
      boton_tarjeta, 
      estado_curso, 
      visibilidad,
      mostrar_promo,
      texto_promo,
      mostrar_precio,
      precio_curso,
      precio_original,
      usuarios,
      max_estudiantes,
      fecha_inicio
    `,
    )
    .eq('visibilidad', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando cursos:', error);
    return;
  }

  // Filtrar además por estados activos
  const visibles = (data ?? []).filter((c) =>
    ['Activo', 'Completo', 'Lista de espera'].includes(c.estado_curso ?? 'Activo'),
  );

  cursosPromo.value = visibles.map((c) => {
    const numUsuarios = Array.isArray(c.usuarios) ? c.usuarios.length : 0;
    const maxEstudiantes = c.max_estudiantes || 0;
    const estadoCurso = c.estado_curso || 'Activo';

    let buttonLink = '';

    if (estadoCurso === 'Completo' || estadoCurso === 'Lista de espera') {
      buttonLink = `/ReservasCursos?id=${c.id}`;
    } else if (estadoCurso === 'Activo') {
      if (numUsuarios >= maxEstudiantes) {
        buttonLink = `/ReservasCursos?id=${c.id}`;
      } else {
        // FIX: usar backticks correctamente para interpolar el id
        buttonLink = `/ReservasCursos?id=${c.id}`;
      }
    } else {
      buttonLink = `/ReservasCursos?id=${c.id}`;
    }

    return {
      id: c.id,
      imagen_tarjeta: (c.imagen_tarjeta ?? '').replace(/^['"]|['"]$/g, '').trim(),
      titulo_tarjeta: c.titulo_tarjeta ?? '',
      texto_tarjeta: c.texto_tarjeta ?? '',
      boton_tarjeta: c.boton_tarjeta ?? 'Reservar',
      showPromo: c.mostrar_promo ?? false,
      promoText: c.texto_promo ?? '¡Prueba tu clase gratis!',
      showPrice: c.mostrar_precio ?? false,
      price: c.precio_curso ?? '',
      originalPrice: c.precio_original ?? '',
      buttonLink,
      fechaInicio: c.fecha_inicio ?? '',
    };
  });
}

//Función para scroll suave a sección
function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

onMounted(async () => {
  await cargarCursosPromo();
  if (route.hash) {
    await nextTick();
    if (route.hash) {
      await nextTick();
      scrollDirecto(route.hash);
    }
  }
});
watch(
  () => route.hash,
  (h) => {
    if (h) scrollDirecto(h);
  },
);
</script>

<style>
.botones-clases {
  width: 100%;
  gap: 100px;
  flex-wrap: nowrap;
  justify-content: center;

  @media (min-width: 1024px) {
    max-width: 500px;
    margin: 0 auto;
    gap: 250px;
  }

  @media (max-width: 599px) {
    gap: 8px;
  }
}

.botones-clases .q-btn {
  flex: 0 0 auto;
  min-width: 0;
  padding: 10px 18px;

  @media (max-width: 767px) {
    flex: 1 1 0;
    padding: 10px 12px;
  }
}

.numeros-div {
  .numero {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1;
  }

  .numero-item {
    text-align: center;
    min-width: 140px;
  }
}

.modalidad-card {
  background: #f7f7f7;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.lista-funcionamiento {
  line-height: 1.6;
}

.lista-funcionamiento li + li {
  margin-top: 6px;
}
</style>
