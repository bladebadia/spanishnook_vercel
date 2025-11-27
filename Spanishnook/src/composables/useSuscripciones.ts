// src/composables/useSuscripciones.ts

import { ref } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar } from 'quasar';

export function useSuscripciones() {
  const { user } = useAuth();
  const $q = useQuasar();
  const procesando = ref(false);

  /**
   * Inicia el proceso de suscripción para un curso.
   * Llama a la Edge Function de Supabase para crear una sesión de checkout en Stripe.
   * @param priceId - El ID del precio en Stripe (ej: 'price_1P...')
   * @param courseId - El ID de tu curso en tu base de datos.
   */
  const handleSubscribe = async (priceId: string, courseId: string) => {
    if (!user.value) {
      $q.notify({
        type: 'warning',
        message: 'Debes iniciar sesión para suscribirte a un curso.',
      });
      // Opcional: redirigir al login
      // router.push('/acceder');
      return;
    }

    procesando.value = true;

    try {
      // Invocamos la Edge Function que creaste
      const { data, error } = await supabase.functions.invoke('subscription-webhook', {
        body: {
          priceId: priceId,
          user_id: user.value.id,
          course_id: courseId,
          customer_email: user.value.email,
          customer_name: user.value.user_metadata?.nombre || user.value.email, // Usa el nombre si existe
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Si todo va bien, la función devuelve una URL de Stripe. Redirigimos al usuario.
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago desde el servidor.');
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      console.error('Error al crear la sesión de suscripción:', errorMessage);
      $q.notify({
        type: 'negative',
        message: 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo más tarde.',
        caption: errorMessage,
      });
    } finally {
      procesando.value = false;
    }
  };

  // Aquí podrías añadir más funciones en el futuro, como:
  // - Cargar el estado de la suscripción del usuario.
  // - Crear un enlace al portal de cliente de Stripe para cancelar.

  return {
    procesando,
    handleSubscribe,
  };
}
