// supabase/functions/cancel-reserva/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  console.log("🔔 Función cancel-reserva ejecutándose");
  console.log("Método:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ Preflight CORS OK");
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Solo permitir POST
    if (req.method !== "POST") {
      console.log("❌ Método no permitido:", req.method);
      return new Response(
        JSON.stringify({ error: "Método no permitido. Use POST." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar contenido
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      console.log("❌ Content-Type incorrecto");
      return new Response(
        JSON.stringify({ error: "Content-Type debe ser application/json" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    console.log("📦 Body recibido:", JSON.stringify(body));

    const { reservaId } = body;
    
    if (!reservaId) {
      console.log("❌ reservaId faltante");
      return new Response(
        JSON.stringify({ error: "reservaId es requerido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 Buscando reserva ID:", reservaId);

    // Verificar variables de entorno
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    console.log("🔧 Variables de entorno:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasStripeKey: !!stripeKey
    });

    if (!supabaseUrl || !serviceRoleKey || !stripeKey) {
      console.log("❌ Variables de entorno faltantes");
      return new Response(
        JSON.stringify({ error: "Configuración del servidor incompleta" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Crear cliente Supabase
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Obtener información de la reserva
    console.log("🔍 Consultando reserva en la base de datos...");
    const { data: reserva, error: reservaError } = await supabase
  .from("reservas")
  .select("id, user_id, fecha, hora, estado, stripe_payment_intent, tipo, precio") // ← ESTA LÍNEA ES CLAVE
  .eq("id", reservaId)
  .eq("estado", "confirmada")
  .single();

if (reservaError || !reserva) {
  return new Response(
    JSON.stringify({ error: "Reserva no encontrada o ya cancelada" }),
    {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

console.log("📊 Reserva encontrada con datos:", {
  id: reserva.id,
  tipo: reserva.tipo,
  precio: reserva.precio,
  stripe_payment_intent: reserva.stripe_payment_intent
});

    if (!reserva.stripe_payment_intent) {
      console.log("❌ No hay stripe_payment_intent");
      return new Response(
        JSON.stringify({ error: "No se encontró información de pago para esta reserva" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Crear reembolso en Stripe
// En cancel-reserva, en la parte del reembolso:
let refund;
try {
  // 1. Verificar si ya hay reembolsos
  const existingRefunds = await stripe.refunds.list({
    payment_intent: reserva.stripe_payment_intent,
  });
  
  const totalYaReembolsado = existingRefunds.data.reduce((sum, r) => sum + r.amount, 0);
  
  // 2. Obtener el payment intent para saber el monto total
  const paymentIntent = await stripe.paymentIntents.retrieve(reserva.stripe_payment_intent);
  const montoTotal = paymentIntent.amount;
  
  const saldoDisponible = montoTotal - totalYaReembolsado;
  
  console.log("💰 Información de reembolso:", {
    reservaId: reserva.id,
    tipo: reserva.tipo,
    precioReserva: reserva.precio,
    montoTotal,
    totalYaReembolsado,
    saldoDisponible
  });
  
  if (saldoDisponible <= 0) {
    console.log("⚠️ No queda saldo por reembolsar en este payment intent");
  } else if (reserva.precio) {
    // 3. Usar el PRECIO EXACTO de esta reserva
    const montoAReembolsar = Math.min(reserva.precio, saldoDisponible);
    
    console.log(`✅ Reembolsando ${montoAReembolsar / 100}€ por reserva ${reserva.tipo}`);
    
    refund = await stripe.refunds.create({
      payment_intent: reserva.stripe_payment_intent,
      amount: montoAReembolsar, // Monto exacto de esta reserva
    });
    
    console.log("✅ Reembolso individual creado:", refund.id, "Monto:", montoAReembolsar);
  } else {
    // Fallback: si no tenemos precio individual
    console.log("⚠️ No hay precio individual, usando división del total");
    const { data: reservasMismoPago } = await supabase
      .from("reservas")
      .select("id, precio")
      .eq("stripe_payment_intent", reserva.stripe_payment_intent)
      .eq("estado", "confirmada");
    
    const totalReservas = reservasMismoPago?.length || 1;
    const montoPorReserva = Math.floor(montoTotal / totalReservas);
    const montoAReembolsar = Math.min(montoPorReserva, saldoDisponible);
    
    refund = await stripe.refunds.create({
      payment_intent: reserva.stripe_payment_intent,
      amount: montoAReembolsar,
    });
    
    console.log("⚠️ Reembolso por división:", montoAReembolsar);
  }
} catch (stripeError: any) {
  console.error("❌ Error en reembolso Stripe:", stripeError);
  
  if (stripeError.code === 'charge_already_refunded') {
    console.log("⚠️ El pago ya fue reembolsado completamente");
  } else {
    return new Response(
      JSON.stringify({ 
        error: `Error procesando reembolso: ${stripeError.message}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

    // 3. Actualizar estado de la reserva
const { error: deleteError } = await supabase
  .from("reservas")
  .delete()
  .eq("id", reservaId);

if (deleteError) {
  console.error("❌ Error eliminando reserva:", deleteError);
  return new Response(
    JSON.stringify({ error: "Error eliminando la reserva" }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

console.log("✅ Reserva eliminada de la base de datos");

return new Response(
  JSON.stringify({ 
    success: true, 
    refundId: refund?.id,
    message: refund ? "Reserva cancelada, reembolso procesado y horario liberado" : "Reserva cancelada y horario liberado"
  }),
  {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  }
);

  } catch (error: any) {
    console.error("💥 Error general en cancel-reserva:", error);
    return new Response(
      JSON.stringify({ error: `Error interno del servidor: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});