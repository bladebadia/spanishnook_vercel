import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

// Interfaces
export interface ReservaCarrito {
  id?: string;
  fecha: string;
  hora: string;
  tipo: 'normal' | 'conversacion';
}

export interface ReservaConfirmada {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  estado: string;
  created_at?: string;
  tipo?: 'normal' | 'conversacion';
  precio?: number;
}

export function useReservasClases() {
  const $q = useQuasar();
  const { t, locale } = useI18n();
  const { user } = useAuth();

  // Estado reactivo
  const seleccionClases = ref<string | null>(null);
  const fechaSeleccionada = ref('');
  const horasOcupadas = ref<string[]>([]);
  const misReservas = ref<ReservaConfirmada[]>([]);
  const carrito = ref<ReservaCarrito[]>([]);
  const tipoClase = ref<'normal' | 'conversacion'>('normal');

  // Computed properties
  const opcionesTipoClase = computed(() => [
    {
      label: `${t('individuales.claseNormal')} (32€)`,
      value: 'normal',
    },
    {
      label: `${t('individuales.claseConversacion')} (20€)`,
      value: 'conversacion',
    },
  ]);

  // Fechas mínima y máxima (3 meses vista)
  const fechaMinima = new Date().toISOString().split('T')[0];
  const fechaMaxima = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  });

  // Horarios disponibles
  const todosLosHorarios = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // Fechas que tienen eventos (para el calendario)
  const fechasConEventos = computed(() => {
    const fechas = new Set();
    misReservas.value.forEach((reserva) => fechas.add(reserva.fecha));
    carrito.value.forEach((reserva) => fechas.add(reserva.fecha));
    return Array.from(fechas) as string[];
  });

  // Horarios disponibles filtrados
  const horariosDisponiblesFiltrados = computed(() => {
    return todosLosHorarios.filter(
      (hora) => !horasOcupadas.value.includes(hora) && !estaEnCarrito(hora),
    );
  });

  // Funciones utilitarias
  const activarSeleccionClases = () => {
    seleccionClases.value = 'activa';
  };

  // Opciones para fechas disponibles
  const opcionesFechas = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();

    maxDate.setMonth(today.getMonth() + 3);
    today.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return false;
    if (selectedDate > maxDate) return false;

    const day = selectedDate.getDay();
    return day !== 0 && day !== 6; // Excluir fines de semana
  };

  // Función para obtener el texto del tipo de clase
  const getTipoClaseTexto = (reserva: ReservaConfirmada): string => {
    return reserva.tipo === 'normal' 
      ? t('individuales.claseNormal') 
      : t('individuales.claseConversacion');
  };

  // Función para obtener el precio
  const getPrecioClase = (reserva: ReservaConfirmada): number => {
    return reserva.tipo === 'normal' ? 32 : 20;
  };

  // Función formatFecha mejorada con i18n
  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    
    // Mapear locales de i18n a locales del navegador
    const localeMap: { [key: string]: string } = {
      'es': 'es-ES',
      'es-ES': 'es-ES',
      'en': 'en-US',
      'en-US': 'en-US',
      'fr': 'fr-FR',
      'fr-FR': 'fr-FR',
      'de': 'de-DE',
      'de-DE': 'de-DE'
    };
    
    const currentLocale = localeMap[locale.value] || 'es-ES';
    
    console.log('🌐 Formateando fecha:', fecha, 'con locale:', locale.value, '->', currentLocale);
    
    return d.toLocaleDateString(currentLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Cargar TODAS las horas ocupadas (solo confirmadas)
  const cargarHorariosOcupados = async (fecha: string) => {
    if (!fecha) {
      horasOcupadas.value = [];
      return;
    }

    try {
      const { data: reservasConfirmadas, error } = await supabase
        .from('reservas')
        .select('hora')
        .eq('fecha', fecha)
        .eq('estado', 'confirmada');

      if (error) {
        console.error('❌ Error cargando horarios ocupados:', error);
        return;
      }

      horasOcupadas.value = reservasConfirmadas.map((r) => r.hora.slice(0, 5)); // HH:mm
      console.log('✅ Horarios ocupados cargados:', horasOcupadas.value);
    } catch (error) {
      console.error('💥 Error cargando horarios ocupados:', error);
      horasOcupadas.value = [];
    }
  };

  // Verificar si una hora está en el carrito
  const estaEnCarrito = (hora: string) => {
    return carrito.value.some(
      (reserva) => reserva.fecha === fechaSeleccionada.value && reserva.hora === hora,
    );
  };

  // Agregar al carrito
  const agregarAlCarrito = (hora: string) => {
    if (!user.value?.id || !fechaSeleccionada.value) {
      $q.notify({
        type: 'warning',
        message: t('individuales.debesIniciarSesion'),
        timeout: 3000
      });
      return;
    }

    if (horasOcupadas.value.includes(hora)) {
      $q.notify({
        type: 'negative',
        message: t('individuales.horarioNoDisponible'),
        timeout: 3000
      });
      return;
    }

    if (estaEnCarrito(hora)) {
      $q.notify({
        type: 'warning',
        message: t('individuales.horarioEnCarrito'),
        timeout: 3000
      });
      return;
    }

    carrito.value.push({
      fecha: fechaSeleccionada.value,
      hora: hora,
      tipo: tipoClase.value,
    });

    guardarCarrito();
    
    $q.notify({
      type: 'positive',
      message: t('individuales.horarioAgregado'),
      timeout: 2000
    });
  };

  // Quitar del carrito
  const quitarDelCarrito = async (index: number) => {
    if (index < 0 || index >= carrito.value.length) return;

    const reserva: ReservaCarrito | undefined = carrito.value[index];
    if (!reserva) return;

    carrito.value.splice(index, 1);
    guardarCarrito();

    // Actualizar disponibilidad si es la fecha seleccionada
    if (fechaSeleccionada.value === reserva.fecha) {
      await cargarHorariosOcupados(fechaSeleccionada.value);
    }

    $q.notify({
      type: 'info',
      message: t('individuales.horarioEliminado'),
      timeout: 2000
    });
  };

  // Guardar carrito
  const guardarCarrito = () => {
    try {
      localStorage.setItem('carritoReservas', JSON.stringify(carrito.value));
      console.log('💾 Carrito guardado:', carrito.value);
    } catch (error) {
      console.error('❌ Error guardando carrito:', error);
    }
  };

  // Cargar carrito
  const cargarCarrito = () => {
    try {
      const carritoGuardado = localStorage.getItem('carritoReservas');
      if (carritoGuardado) {
        carrito.value = JSON.parse(carritoGuardado);
        console.log('📦 Carrito cargado:', carrito.value);
      }
    } catch (error) {
      console.error('❌ Error cargando carrito:', error);
      carrito.value = [];
    }
  };

  // Cargar mis reservas confirmadas
  const cargarMisReservas = async () => {
    if (!user.value?.id) {
      console.log('❌ No hay usuario logueado');
      misReservas.value = [];
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('estado', 'confirmada')
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('❌ Error cargando reservas:', error);
        return;
      }

      console.log('✅ Reservas cargadas desde BD:', data);
      misReservas.value = data || [];
    } catch (error) {
      console.error('💥 Error cargando reservas:', error);
      misReservas.value = [];
    }
  };

  // Función para verificar si se puede cancelar una reserva
  const puedeCancelar = (reserva: ReservaConfirmada): boolean => {
    const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
    const ahora = new Date();
    const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return diferenciaHoras >= 72;
  };

  // Cancelar reserva con confirmación + Stripe refund
  const cancelarReserva = (reserva: ReservaConfirmada) => {
    // Validar 72 horas en el frontend primero
    const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
    const ahora = new Date();
    const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    console.log('⏰ Validación frontend - Diferencia en horas:', diferenciaHoras);

    if (diferenciaHoras < 72) {
      const horasRestantes = Math.max(0, Math.floor(diferenciaHoras));
      $q.notify({
        type: 'negative',
        message: t('individuales.noPuedeCancelarMenos72'),
        caption: `${t('individuales.tiempoRestante')}: ${horasRestantes} ${t('individuales.horas')}`,
        timeout: 6000,
        actions: [{ icon: 'close', color: 'white' }],
      });
      return;
    }

    $q.dialog({
      title: t('individuales.cancelarReserva'),
      message: `${t('individuales.confirmarCancelacion')} ${formatFecha(reserva.fecha)} ${t('individuales.aLas')} ${reserva.hora.slice(0, 5)}? ${t('individuales.seReembolsara')}`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          console.log('🔄 Enviando solicitud de cancelación para reserva:', reserva.id);

          const { data, error } = await supabase.functions.invoke('cancel-reserva', {
            body: { reservaId: reserva.id },
          });

          console.log('📨 Respuesta recibida:', { data, error });

          if (error) {
            throw new Error(error.message || 'Error desconocido en la función');
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          // Actualizar la lista local
          misReservas.value = misReservas.value.filter((r) => r.id !== reserva.id);

          // Recargar disponibilidad
          if (fechaSeleccionada.value) {
            await cargarHorariosOcupados(fechaSeleccionada.value);
          }

          $q.notify({
            type: 'positive',
            message: data?.message || t('individuales.reservaCanceladaExito'),
            timeout: 5000,
          });
        } catch (err: unknown) {
          console.error('💥 Error cancelando reserva:', err);
          let errorMessage = t('individuales.errorCancelarReserva');

          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }

          $q.notify({
            type: 'negative',
            message: errorMessage,
            timeout: 6000,
          });
        }
      })();
    });
  };

  // Inicialización
  const inicializar = async () => {
    cargarCarrito();
    await cargarMisReservas();
  };

  // Watchers
  const setupWatchers = () => {
    watch(
      () => fechaSeleccionada.value,
      (nuevaFecha: string) => {
        if (nuevaFecha) {
          void cargarHorariosOcupados(nuevaFecha);
        }
      },
    );
  };

  // Lifecycle hook
  onMounted(async () => {
    await inicializar();
    setupWatchers();
  });

  // API pública del composable
  return {
    // Estado reactivo
    seleccionClases,
    fechaSeleccionada,
    horasOcupadas,
    misReservas,
    carrito,
    tipoClase,

    // Computed properties
    opcionesTipoClase,
    fechaMinima,
    fechaMaxima,
    todosLosHorarios,
    fechasConEventos,
    horariosDisponiblesFiltrados,

    // Métodos
    activarSeleccionClases,
    opcionesFechas,
    getTipoClaseTexto,
    getPrecioClase,
    formatFecha,
    cargarHorariosOcupados,
    estaEnCarrito,
    agregarAlCarrito,
    quitarDelCarrito,
    guardarCarrito,
    cargarCarrito,
    cargarMisReservas,
    puedeCancelar,
    cancelarReserva,
    inicializar,
    setupWatchers
  };
}
