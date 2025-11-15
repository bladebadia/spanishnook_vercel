<!-- filepath: /workspaces/Spanishnook/Spanishnook/src/components/PromoCard.vue -->
<template>
  <div class="q-pa-none q-ma-none">
    <q-card class="altura q-ma-none q-pa-none">
      <q-img
        :src="imageSrc"
        fit="contain"
        :style="computedImageStyle"
        class="card-img-animada "
        ratio="1"
        @error="onImageError"
      />
      <q-card-section class="text-center subtitulo-responsivo margenes">
        {{ title }}
      </q-card-section>
      <q-card-section class="texto-responsivo text-justify margenes">
        {{ description }}
      </q-card-section>
      <q-card-actions class="flex flex-center" >
        <q-btn
          color="primary"
          :to="buttonLink"
          class="oval-btn btn-fijo"
          unelevated
          @click="handleButtonClick"
        >
          {{ buttonText }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import '../css/pages/EstilosGenerales.css';

interface Props {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  imageStyle?: string;
}

const props = defineProps<Props>();

// Definir el emit para el evento del botón
const emit = defineEmits<{
  buttonClick: [];
}>();

const handleButtonClick = () => {
  emit('buttonClick');
};

const computedImageStyle = computed(() => {
  const baseStyle = 'max-height: 180px; width: auto; margin: 0 auto; display: block';
  return props.imageStyle ? `${baseStyle}; ${props.imageStyle}` : baseStyle;
});

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  console.warn('Error cargando imagen:', target.src);
  target.src = '/img/estudiante_1024.jpg';
};
</script>

<style scoped>
.btn-fijo {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  
  max-width: 500px;
  padding: 10px 10px;
  font-size: 1rem !important;
  margin: 0px 0px !important;
}
@media (max-width: 600px) {
  .btn-fijo {
    font-size: 0.8rem !important;
    padding: 10px 10px;
  }

}

.altura{
  height: 100%;
   position: relative;
   padding-bottom: 70px;
}
@media (max-width: 600px) {
  .margenes {
    padding: 0px;
  }

}

/* Agregar efecto hover */
.tarjeta-onPromo1:hover {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 0 0 2px rgba(133, 19, 25, 0.15) !important;
  transform: translateY(-2px);
}

/* Animación de imagen */
.card-img-animada {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
  overflow: hidden;
}

.card-img-animada:hover {
  transform: scale(1.15);
}


/* ========== RESPONSIVE DESIGN ========== */

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .tarjeta-onPromo1 {
    width: 100%;
    position: relative;
  }

}




  /* Mantener el efecto hover en móviles pero más sutil */
  .tarjeta-onPromo1:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(133, 19, 25, 0.12) !important;
    transform: translateY(-1px);
  }

</style>
