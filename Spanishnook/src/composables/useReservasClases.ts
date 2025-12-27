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

export interface DiaCalendario {
  fecha: string;
  tipo_dia: string; // 'laborable', 'especial', 'festivo', 'null'
  horario: string[];
}

export function useReservasClases() {
  const $q = useQuasar();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  console.log('👤 Usuario actual en useReservasClases:', user.value);

  // Estado reactivo
  const seleccionClases = ref<string | null>(null);
  const fechaSeleccionada = ref('');
  const horasOcupadas = ref<string[]>([]);
  const misReservas = ref<ReservaConfirmada[]>([]);
  const carrito = ref<ReservaCarrito[]>([]);
  const tipoClase = ref<'normal' | 'conversacion'>('normal');
  const calendario = ref<DiaCalendario[]>([]);
  const reservasExistentes = ref<ReservaConfirmada[]>([]);

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

  // Fechas mínima y máxima
  const fechaMinima = computed<string>(() => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Mínimo mañana
    return hoy.toISOString().split('T')[0] || '';
  });

  const fechaMaxima = computed<string>(() => {
    const maxima = new Date();
    maxima.setMonth(maxima.getMonth() + 9); // Máximo 9 meses
    return maxima.toISOString().split('T')[0] || '';
  });

  // Fechas que tienen eventos (días con horarios disponibles en el calendario)
  const fechasConEventos = computed(() => {
    const fechas = new Set<string>();
    
    // Añadir fechas del calendario con horarios disponibles
    calendario.value.forEach((dia) => {
      if ((dia.tipo_dia === 'laborable' || dia.tipo_dia === 'especial') && 
          dia.horario && 
          dia.horario.length > 0) {
        fechas.add(dia.fecha);
      }
    });
    
    // Añadir fechas de mis reservas
    misReservas.value.forEach((reserva) => fechas.add(reserva.fecha));
    
    // Añadir fechas del carrito
    carrito.value.forEach((reserva) => fechas.add(reserva.fecha));
    
    return Array.from(fechas);
  });

  // ✅ NUEVO: Computed para opciones de fechas (en lugar de función)
  const opcionesFechasComputed = computed(() => {
    // Crear un Set con todas las fechas válidas
    const fechasValidas = new Set<string>();
    
    calendario.value.forEach((dia) => {
      // Solo agregar si es laborable/especial con horarios
      if ((dia.tipo_dia === 'laborable' || dia.tipo_dia === 'especial') && 
          dia.horario && 
          dia.horario.length > 0) {
        fechasValidas.add(dia.fecha);
      }
    });
    
    console.log('✅ Fechas válidas computed:', Array.from(fechasValidas));
    
    // Devolver función que verifica contra el Set
    return (fecha: string): boolean => {
      const fechaMin = fechaMinima.value;
      const fechaMax = fechaMaxima.value;
      
      // Validar rango
      if (fecha < fechaMin || fecha > fechaMax) {
        return false;
      }
      
      // Verificar si está en el Set
      const esValida = fechasValidas.has(fecha);
      
      return esValida;
    };
  });


  // Horarios disponibles filtrados según calendario y reservas
  const horariosDisponiblesFiltrados = computed(() => {
    if (!fechaSeleccionada.value) return [];

    // Obtener horarios del día en el calendario
    const diaCalendario = calendario.value.find(d => d.fecha === fechaSeleccionada.value);
    if (!diaCalendario || !diaCalendario.horario || diaCalendario.horario.length === 0) {
      return [];
    }

    // Filtrar horarios ocupados (reservas confirmadas) y los del carrito
    const horariosReservados = reservasExistentes.value
      .filter(r => r.fecha === fechaSeleccionada.value && r.estado === 'confirmada')
      .map(r => r.hora.slice(0, 5));

    return diaCalendario.horario.filter(
      (hora) => !horariosReservados.includes(hora) && !estaEnCarrito(hora)
    );
  });
  // Funciones utilitarias
  const activarSeleccionClases = () => {
    seleccionClases.value = 'activa';
  };

  // Mantener la función original para compatibilidad
  const opcionesFechas = (fecha: string): boolean => {
    return opcionesFechasComputed.value(fecha);
  };
  // Función para obtener el texto del tipo de clase
  const getTipoClaseTexto = (reserva: ReservaConfirmada): string => {
    return reserva.tipo === 'normal' 
      ? t('individuales.claseNormal') 
      : t('individuales.claseConversacion');
  };

  // Función para obtener el precio
  const getPrecioClase = (reserva: ReservaConfirmada): number => {
    return reserva.precio || (reserva.tipo === 'normal' ? 32 : 20);
  };

  // Función formatFecha mejorada con i18n
  const formatFecha = (fecha: string) => {
    const d = new Date(fecha + 'T00:00:00');
    
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
    
    return d.toLocaleDateString(currentLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Cargar calendario desde Supabase
  const cargarCalendario = async (): Promise<void> => {
    try {
      const fechaMin = fechaMinima.value;
      const fechaMax = fechaMaxima.value;

      console.log('📅 Cargando calendario entre:', fechaMin, 'y', fechaMax);

      const { data, error } = await supabase
        .from('Calendario')
        .select('fecha, tipo_dia, horario')
        .gte('fecha', fechaMin)
        .lte('fecha', fechaMax)
        .order('fecha', { ascending: true });

      if (error) throw error;

      console.log('📊 Datos crudos del calendario:', data);

      calendario.value = (data || []).map(dia => ({
        fecha: dia.fecha,
        tipo_dia: dia.tipo_dia || 'null',
        horario: Array.isArray(dia.horario) ? dia.horario : (dia.horario ? [dia.horario] : [])
      }));

      console.log('✅ Calendario procesado:', calendario.value);
      console.log('📅 Total días cargados:', calendario.value.length);
      
      // Debug: mostrar días laborables/especiales
      const diasDisponibles = calendario.value.filter(d => 
        (d.tipo_dia === 'laborable' || d.tipo_dia === 'especial') && 
        d.horario.length > 0
      );
      console.log('✅ Días disponibles (laborable/especial con horarios):', diasDisponibles);

    } catch (error) {
      console.error('❌ Error cargando calendario:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar el calendario',
        timeout: 2000
      });
    }
  };


  // Cargar reservas existentes (para marcar horarios ocupados)
  const cargarReservasExistentes = async (): Promise<void> => {
    try {
      const fechaMin = fechaMinima.value;
      const fechaMax = fechaMaxima.value;

      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha', fechaMin)
        .lte('fecha', fechaMax)
        .eq('estado', 'confirmada');

      if (error) throw error;

      reservasExistentes.value = data || [];
      console.log('📊 Reservas existentes cargadas:', reservasExistentes.value.length);
    } catch (error) {
      console.error('❌ Error cargando reservas existentes:', error);
    }
  };

  // Cargar horarios ocupados para una fecha específica
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

      horasOcupadas.value = reservasConfirmadas.map((r) => r.hora.slice(0, 5));
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
            await cargarReservasExistentes();
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
    await cargarCalendario();
    await cargarReservasExistentes();
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
  onMounted(() => {
    void (async () => {
      await inicializar();
      setupWatchers();

      // Suscripción a cambios en tiempo real
      const subscription = supabase
        .channel('reservas-calendario-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservas' },
          () => {
            void cargarReservasExistentes();
            void cargarMisReservas();
            if (fechaSeleccionada.value) {
              void cargarHorariosOcupados(fechaSeleccionada.value);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Calendario' },
          () => {
            void cargarCalendario();
          }
        )
        .subscribe();

      // Cleanup al desmontar
      return () => {
        void subscription.unsubscribe();
      };
    })();
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
    calendario,
    reservasExistentes,

    // Computed properties
    opcionesTipoClase,
    fechaMinima,
    fechaMaxima,
    fechasConEventos,
    horariosDisponiblesFiltrados,
    opcionesFechasComputed, // ✅ NUEVO: exportar computed

    // Métodos
    activarSeleccionClases,
    opcionesFechas,
    getTipoClaseTexto,
    getPrecioClase,
    formatFecha,
    cargarCalendario,
    cargarReservasExistentes,
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