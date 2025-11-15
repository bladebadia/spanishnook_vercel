<template>
  <q-layout view="lHh Lpr fff">
    <!-- Inicio  -->
    <q-header elevated>
      <!-- Inicio barra superior -->
      <q-bar>
        <q-space></q-space>
        <!-- Boton Area Personal -->
        <q-btn to="/AreaPersonal" v-if="user" flat class="text-white btn-nav-superior"
          >{{ $t('areaPersonal') }}
        </q-btn>
        <!-- Boton Acceder / Carrito -->
        <q-btn to="/Acceder" v-if="!user" flat class="text-white btn-nav-superior"
          >{{ $t('acceder') }}
        </q-btn>
        <q-btn
          to="/CarritoCompra"
          v-if="user"
          class="text-white carro-btn"
          icon="shopping_cart"
          flat
        >
          <q-badge v-if="carritoCount > 0" color="red" floating rounded class="badge-notification">
            {{ carritoCount }}
          </q-badge>
        </q-btn>

        <!-- Selector de idioma con banderas -->
        <div class="row items-center q-gutter-xs">
          <q-btn
            :class="locale === 'es-ES' ? 'flag-selected' : 'flag-unselected'"
            @click="changeLang('es-ES')"
            class="flag-btn flag-es"
          >
            <q-img
              src="https://flagcdn.com/w40/es.png"
              alt="Español"
              style="width: 24px; height: 16px"
            />
          </q-btn>
          <q-btn
            :class="locale === 'en-US' ? 'flag-selected' : 'flag-unselected'"
            @click="changeLang('en-US')"
            class="flag-btn flag-en"
          >
            <q-img
              src="https://flagcdn.com/w40/gb.png"
              alt="English"
              style="width: 24px; height: 16px; border-radius: 2px"
            />
          </q-btn>
        </div>
      </q-bar>

      <q-toolbar>
        <q-btn
          v-if="$q.screen.lt.md" 
          flat         
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          style="font-size: 1rem"
        />
      <div class="q-ma-none q-pa-none">
        <img
          round
          src="/img/Logotexto_500.png"
          alt="Logo Spanish nook"
          class="logo-responsivo"        
         
        />
      </div>
      <div>
        <q-toolbar-title class="spanishnook-titl"> SpanishNook </q-toolbar-title>
      </div>  
        <!-- Navegación con botones -->
        <div class=" nav-container  " v-if="$q.screen.gt.sm">
          <q-btn 
            flat 
            :to="'/'" 
            exact 
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'inicio' }"            
          >
            {{ $t('inicio') }}
          </q-btn>
    
          <q-btn 
            flat
            class="nave-btn" 
            :class="{ 'nave-btn-active': activeButton === 'clases' }"
            :label="$t('clases')"
            to="/ClasesIndividuales"
          >
          </q-btn>
    
          <q-btn 
            flat 
            :to="'/TestNivel'" 
            exact 
            class="nave-btn" 
            :class="{ 'nave-btn-active': activeButton === 'testNivel' }"
          >
            {{ $t('testNivel') }}
          </q-btn>
          
          <q-btn 
            flat 
            :to="'/sobreSpanish'" 
            exact 
            class="nave-btn" 
            :class="{ 'nave-btn-active': activeButton === 'sobreSpanish' }"
          >
            {{ $t('sobre') }}
          </q-btn>
          
          <q-btn 
            flat 
            :to="'/Contacto'" 
            exact 
            class="nave-btn" 
            :class="{ 'nave-btn-active': activeButton === 'contacto' }"
          >
            {{ $t('contacto') }}
          </q-btn>
        </div>
        
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-banner
        v-if="showCookiesBanner"
        class="bg-primary text-white shadow-2 cookies-banner"
        style="
          position: fixed;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          width: 70vw;
          max-width: 900px;
          z-index: 9999;
          font-size: 1.25rem;
          border-radius: 18px;
          padding: 24px 32px;
        "
        icon="cookie"
      >
        <div class="row items-center justify-between">
          <div style="line-height: 1.5">
            Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de
            usuario y analizar el tráfico. Si continúas navegando, consideramos que aceptas su uso.
            <q-btn
              flat
              dense
              color="white"
              label="Política de Cookies"
              to="/Cookies"
              class="q-ml-sm"
            />
          </div>
          <q-btn
            color="white"
            text-color="primary"
            label="Aceptar"
            @click="aceptarCookies"
            class="q-ml-md text-weight-bold"
            style="font-size: 1.1rem; padding: 8px 24px; border-radius: 8px"
          />
        </div>
      </q-banner>
      <router-view />
    </q-page-container>

    <q-page-sticky position="bottom-right" :offset="[10, 10]">
      <q-btn
        class="whatsapp-sticky-btn enlarged-touch"
        round
        color="green-6"
        icon="mdi-whatsapp"
        size="xl"
        href="https://wa.me/34600000000"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
      />
    </q-page-sticky>
    <q-footer class="bg-black text-white">
      <q-bar class="q-pa-none q-ma-none">
        <div class="foot-link q-mr-lg q-mb-xs">{{ $t('footerDerechosReservados') }}</div>
      </q-bar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/stores/auth';
import { useRoute } from 'vue-router';

const { user } = useAuth();
const { locale, t } = useI18n();

// Banner de cookies
const showCookiesBanner = ref(false);
function aceptarCookies() {
  localStorage.setItem('cookies_accepted', 'true');
  showCookiesBanner.value = false;
}

// Contador del carrito
const carritoCount = ref(0);

// Cargar carrito desde localStorage
const cargarCarrito = () => {
  const carritoGuardado = localStorage.getItem('carritoReservas');
  if (carritoGuardado) {
    const carrito = JSON.parse(carritoGuardado);
    carritoCount.value = carrito.length;
  } else {
    carritoCount.value = 0;
  }
};

// Escuchar cambios en el localStorage (para actualizar en tiempo real)
const setupCarritoListener = () => {
  window.addEventListener('storage', (event) => {
    if (event.key === 'carritoReservas') {
      cargarCarrito();
    }
  });
};

// Temporizador para verificar cambios (por si las páginas están en la misma pestaña)
const temporizadorCarrito = ref<number | null>(null);

const iniciarTemporizadorCarrito = () => {
  temporizadorCarrito.value = window.setInterval(() => {
    cargarCarrito();
  }, 1000); // Verificar cada segundo
};

const activeButton = ref('');
const route = useRoute();

// Watcher para detectar cambios de ruta
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') activeButton.value = 'inicio';
    else if (newPath === '/ClasesIndividuales' || newPath === '/ClasesGrupales')
      activeButton.value = 'clases';
    else if (newPath === '/TestNivel') activeButton.value = 'testNivel';
    else if (newPath === '/sobreSpanish') activeButton.value = 'sobreSpanish';
    else if (newPath === '/Contacto') activeButton.value = 'contacto';
    else activeButton.value = '';
  },
  { immediate: true },
);

onMounted(() => {
  showCookiesBanner.value = localStorage.getItem('cookies_accepted') !== 'true';
  localStorage.removeItem('carritoReservas');
  carritoCount.value = 0;
  cargarCarrito();
  setupCarritoListener();
  iniciarTemporizadorCarrito();
});

onUnmounted(() => {
  if (temporizadorCarrito.value !== null) {
    clearInterval(temporizadorCarrito.value);
  }
});

function changeLang(val: string) {
  locale.value = val;
  // Aquí puedes añadir lógica adicional para cambiar el idioma
  // Por ejemplo, actualizar las traducciones de i18n
}

const linksList = computed((): EssentialLinkProps[] => [
  {
    title: t('inicio'),
    icon: 'home',
    link: '/',
  },
  {
    title: t('testNivel'),
    icon: 'code',
    link: '/TestNivel',
  },
  {
    title: t('clases'),
    icon: 'record_voice_over',
    link: '/ClasesIndividuales',
  },
  {
    title: t('sobre'),
    icon: 'rss_feed',
    link: '/SobreSpanish',
  },
  {
    title: t('contacto'),
    icon: 'rss_feed',
    link: '/Contacto',
  },
]);

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="scss">
// Botón barra superior
.btn-nav-superior {
  font-size: 0.8rem !important;
  font-weight: 300 !important;
  text-decoration: underline;
  margin-right: 5%;  
  
  @media (min-width: 1024px) {
    font-size: 1rem !important;
  }
}

/* Botón del carrito responsivo */
.carro-btn { 
    padding: 2px;    
    .q-icon {
      font-size: 2rem !important;
    }

  /* Padding responsivo del botón */
  @media (min-width: 300px) {
    padding: 2px;    
    .q-icon {
      font-size: 1.5rem !important;
    }
  }  
  
  @media (min-width: 1920px) {
    .q-icon {
      font-size: 2rem !important;
    }
  }
}

/* Badge responsivo */
.badge-notification {
  font-size: 8px;
  padding: 1px 3px;
  min-width: 14px;
  height: 14px;
  top: -3px;
  right: -3px;
  
  @media (min-width: 300px) {
    font-size: 9px;
    padding: 2px 4px;
    min-width: 16px;
    height: 16px;
    top: -4px;
    right: -4px;
  }
  
  @media (min-width: 1024px) {
    font-size: 10px;
    padding: 2px 5px;
    min-width: 18px;
    height: 18px;
    top: -5px;
    right: -5px;
  }
}

/* Logo responsivo */
.logo-responsivo {
  height: auto;
  margin: 0;
  padding: 0;
  display: inline-block;
  
  /* Móviles pequeños (xs) */
  width: 50px;  
  
  /* Móviles grandes y tablets (sm) */
  @media (min-width: 600px) and (max-width: 1023px) {
    width: 55px;
  }
  
  /* Escritorio (md y superior) */
  @media (min-width: 1024px) {
    width: 60px;
  }
  
  /* Escritorio grande (xl) */
  @media (min-width: 1920px) {
    width: 60px;
  }
}
/* Título Spanishnook responsivo */
.spanishnook-titl {
  font-weight: bold !important;
  margin-left: 8px;
  margin-right: auto;
  
  /* Móviles pequeños */
  font-size: 1.2rem !important;
  
  /* Móviles grandes y tablets */
  @media (min-width: 600px) and (max-width: 1023px) {
    font-size: 1.3rem !important;
  }
  
  /* Escritorio pequeño */
  @media (min-width: 1024px) and (max-width: 1439px) {
    font-size: 1rem !important;
  }
  
  
  
}


/* Botón de navegación con mayor especificidad */
.nave-btn {
  font-weight: 500 !important;
  color: white !important;
  padding: 8px 16px !important;
  transition: all 0.8s ease;
  
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    transform: scale(1.1);
  }

   @media (min-width: 600px) and (max-width: 1220px) {
    font-size: 0.7rem !important;
  }
  
  
  @media (min-width: 1440px) {
    font-size: 1rem !important;
  }
}
  
.q-btn.nave-btn.nave-btn-active {
  font-weight: 800 !important;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background-color: white;
    border-radius: 1px;
  }
}
 
/* Contenedor de navegación centrado */
.nav-container {  
 display: flex !important;
  align-items: center !important;
  margin-left: 8% !important;
  width: 100% !important;
  gap:3rem !important;
  padding: 0 3rem !important;
  @media (max-width: 1224px) {
    padding: 0 1rem !important;
    margin-left: 4% !important;
  }
}  
  

/* También para el dropdown de Clases */
.q-btn-dropdown.nav-btn.router-link-active .q-btn__content {
  text-decoration: underline !important;
  text-underline-offset: 4px !important;
}
.q-btn-dropdown {
  .q-btn__content {
    flex-direction: row !important;
    justify-content: space-between;
    min-width: 100px;
  }

  .q-icon {
    font-size: 1.2em;
    margin-left: 4px;
  }
}


.img-responsiv {
  width: 100%;
  height: auto;
  max-width: 150px;
  max-height: 150px;
}

.footer-link {
  color: white !important;
  font-weight: bold;
  text-decoration: none !important;
  display: inline-block;
  
  &:hover {
    transform: translateX(8px);
  }
}

.footer-bar {
  min-height: 48px;
  font-size: 1.1rem;
  margin-top: 16px;
}

.whatsapp-sticky-btn {
  .enlarged-touch {
    min-width: 72px;
    min-height: 72px;
    padding: 12px !important;
    box-sizing: content-box;
  }
}

/* Estilos para las banderas */
.flag-selected {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
}

.flag-unselected {
  opacity: 0.7;
  border: 2px solid transparent;
  
  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.carrito {
  position: relative;
}

/* Contenedor de banderas responsivo */
.flags-container {
  gap: 4px;
  
  @media (min-width: 600px) {
    gap: 8px;
  }
  
  @media (min-width: 1024px) {
    gap: 12px;
  }
}

/* Botones de banderas responsivos */
.flag-btn {
  margin: 0 2px;
  
  @media (max-width: 599px) {
    margin: 0 4px;
    padding: 2px;
  }
  
  @media (min-width: 600px) and (max-width: 1023px) {
    margin: 0 8px;
    padding: 4px;
  }
  
  @media (min-width: 1024px) {
    margin: 0 12px;
    padding: 6px;
  }
  
  @media (min-width: 1920px) {
    margin: 0 16px;
    padding: 8px;
  }
}

.flag-es {
  @media (max-width: 599px) {
    margin-left: 8px;
  }
  
  @media (min-width: 600px) {
    margin-left: 16px;
  }
  
  @media (min-width: 1024px) {
    margin-left: 24px;
  }
}

.flag-en {
  @media (max-width: 599px) {
    margin-right: 8px;
  }
  
  @media (min-width: 600px) {
    margin-right: 16px;
  }
  
  @media (min-width: 1024px) {
    margin-right: 24px;
  }
}

.footer-titulo {
  font-weight: bold !important;
  font-size: 1rem !important;
  
  
  @media (max-width: 599px) {
    font-size: 1rem !important;
    margin-top: 20px;
  }
  
  @media (min-width: 600px) and (max-width: 1023px) {
    font-size: 1rem !important;
  }
  
  @media (min-width: 1024px) {
    font-size: 1rem !important;
  }
}

/* Contenedor de links del footer */
.footer-links-container {
  display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 32px;
    width: 100%;
    max-width: 300px;

  /* Móviles: dos columnas */
  @media (max-width: 599px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 32px;
    width: 100%;
    max-width: 300px;
    
    .footer-link {
      
      font-size: 0.9rem !important;
      padding: 4px 8px;
    }
  }

  
}

.foot-link {
  color: white !important;
  font-weight: bold;
  text-decoration: none !important;
  display: inline-block;
  transition: all 0.3s ease;
  border-radius: 4px;
  font-size: 0.8rem !important;
  padding: 0px 0px;
  margin: 0px 0;
  
  &:hover {
    transform: translateX(8px);
  }
  
  /* Responsivo */
  @media (max-width: 599px) {
    font-size: 0.8rem !important;
    &:hover {
      transform: scale(1.05); /* En móvil, solo escalar en lugar de mover */

    }
  }
}

</style>
