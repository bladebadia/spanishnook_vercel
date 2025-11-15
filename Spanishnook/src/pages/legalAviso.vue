<template>
  <div class="legal-page q-pa-lg">
    <p class="text-primary text-bold text-center titulo-responsivo">Aviso legal</p>
    <p class="text-primary text-bold subtitulo-responsivo">Responsable de la web</p>
    <p class=" text-left text-justify texto-responsivo">
      De conformidad con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE), se informa que la titularidad de este sitio web [www.spanishnook.com] corresponde a:
    </p>
    <ul class="lista-puntos texto-responsivo q-ml-xl">
      <li>Nombre: Spanish Nook</li>
      <li>NIF: 77127036D</li>
      <li>Dirección: Calle Ejemplo, 123, Madrid, España</li>
      <li>Teléfono: +34 600 123 456</li>
      <li>Email: info@spanishnook.com</li>
    </ul>
    <p class="q-pt-md text-primary text-bold subtitulo-responsivo">
      Objeto
    </p>
    <p class=" text-left  text-justify texto-responsivo">
      La presente web tiene como finalidad ofrecer servicios de enseñanza de español online mediante clases en vivo.
    </p>
    <p class="q-pt-md text-bold text-primary subtitulo-responsivo">
      Condiciones de uso
    </p>
    <p class="text-left text-justify texto-responsivo">
      El acceso y navegación en este sitio web implica la aceptación de los términos de uso aquí recogidos.
    </p>
    <p class="q-pt-md text-primary text-bold subtitulo-responsivo">
      Limitación de responsabilidad
    </p>
    <p class=" text-left texto-responsivo">
      La titular no se hace responsable de los daños que pudieran derivarse del mal uso de la web ni de enlaces externos a los que pueda redirigir.
    </p>    
  </div>
</template>

<script setup lang="ts">
  import '../css/pages/EstilosGenerales.css';
</script>

<style scoped>
.legal-page {
  max-width: 1200px;
  margin: 0 auto;
}

.lista-puntos {
  list-style-type: disc; /* Punto a la izquierda */
  padding-left: 2em; /* Espaciado a la izquierda */
  margin-top: 1em;
}

.lista-puntos li {
  margin-bottom: 0.5em; /* Espaciado entre elementos */
}
</style>
