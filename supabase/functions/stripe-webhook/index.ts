// index.ts (Supabase Edge Function: stripe-webhook)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe?target=deno";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2022-11-15"
});
const CORS_ORIGIN = "http://localhost:9000";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature, x-client-info, apikey"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const stripeSig = req.headers.get("stripe-signature");
    if (stripeSig) {
      const rawBody = await req.text();
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) {
        console.error("❌ Falta STRIPE_WEBHOOK_SECRET");
        return new Response("Webhook secret not configured", {
          status: 500,
          headers: corsHeaders
        });
      }
      let event;
      try {
        event = await stripe.webhooks.constructEventAsync(rawBody, stripeSig, webhookSecret);
      } catch (err) {
        console.error("❌ Firma webhook inválida:", err?.message);
        return new Response(`Webhook Error: ${err?.message}`, {
          status: 400,
          headers: corsHeaders
        });
      }
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));
      try {
// En la parte del checkout.session.completed, corrige el scope:
if (event.type === "checkout.session.completed") {
  console.log("🔔 Webhook: checkout.session.completed recibido");
  const session = event.data.object;
  console.log("📦 Session metadata:", session.metadata);
  
  const raw = session.metadata?.reservas ?? "[]";
  const userId = session.metadata?.user_id;
  const paymentIntentId = typeof session.payment_intent === "string" 
    ? session.payment_intent 
    : session.payment_intent?.id;

  console.log("🔍 Datos extraídos:", { raw, userId, paymentIntentId });

  let reservas = [];
  try {
    reservas = JSON.parse(raw);
    console.log("✅ Reservas parseadas:", reservas);
  } catch (error) {
    console.error("❌ Error parseando reservas:", error, "Raw:", raw);
  }

  if (!Array.isArray(reservas) || !userId || !paymentIntentId) {
    console.log("❌ Datos inválidos:", {
      isArray: Array.isArray(reservas),
      hasUserId: !!userId,
      hasPaymentIntent: !!paymentIntentId
    });
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: corsHeaders
    });
  }

  // 🔹 1. Verificar si reservas ya están ocupadas
  const { data: ocupadas, error: errorCheck } = await supabase
    .from("reservas")
    .select("fecha, hora")
    .eq("estado", "confirmada")
    .in("fecha", reservas.map(r => r.fecha))
    .in("hora", reservas.map(r => r.hora + ":00"));

  if (errorCheck) console.error("❌ Error verificando reservas:", errorCheck);

  if (ocupadas && ocupadas.length > 0) {
    console.log("❌ Reservas ocupadas, se hará reembolso");
    
    if (paymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
        console.log("✅ Reembolso realizado:", paymentIntentId);
      } catch (err) {
        console.error("❌ Error realizando reembolso:", err);
      }
    }
    
    return new Response(JSON.stringify({
      received: true,
      error: "Reservas ocupadas, pago reembolsado"
    }), {
      status: 409,
      headers: corsHeaders
    });
  }

  // 🔹 2. Obtener line items para los precios
  let lineItems = [];
  try {
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data']
    });
    lineItems = sessionWithLineItems.line_items?.data || [];
    console.log("🛒 Line items obtenidos:", lineItems.length);
  } catch (error) {
    console.error("❌ Error obteniendo line items:", error);
    // Continuar sin line items, usaremos precios por defecto
  }

  // 🔹 3. Insertar reservas confirmadas CON precio y tipo
  const { error: insertError } = await supabase
    .from("reservas")
    .insert(reservas.map((r, index) => {
      // Calcular precio: usar line item si está disponible, sino usar tipo
      let precio;
      if (lineItems[index]) {
        precio = lineItems[index].amount_total;
        console.log(`💰 Precio desde line item ${index}:`, precio);
      } else {
        precio = r.tipo === 'conversacion' ? 2700 : 3200;
        console.log(`💰 Precio por defecto ${index} (${r.tipo}):`, precio);
      }

      return {
        fecha: r.fecha,
        hora: r.hora + ":00",
        estado: "confirmada",
        user_id: userId,
        stripe_payment_intent: paymentIntentId,
        precio: precio,
        tipo: r.tipo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }));

  if (insertError) {
    console.error("❌ Error creando reservas:", insertError);
    console.error("❌ Detalles del error:", {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint
    });
  } else {
    console.log("✅ Reservas confirmadas exitosamente:", reservas.length, "reservas");
  }
}
        // 🔹 4. Manejo de reembolsos (charge.refunded)
        if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
          const charge = event.data.object;
          const raw = charge.metadata?.reservas ?? "";
          const ids = raw.toString().split(",").map((s)=>s.trim()).filter(Boolean);
          if (ids.length > 0) {
            const { error } = await supabase.from("reservas").update({
              estado: "cancelada",
              updated_at: new Date().toISOString()
            }).in("id", ids);
            if (error) console.error("❌ Error cancelando reservas:", error);
            else console.log("✅ Reservas canceladas por reembolso:", ids);
          }
        }
        // 🔹 5. Manejar payment_intent.succeeded para asegurar datos
        if (event.type === "payment_intent.succeeded") {
          const paymentIntent = event.data.object;
          console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
        }
      } catch (err) {
        console.error("❌ Error procesando evento de Stripe:", err);
      }
      return new Response(JSON.stringify({
        received: true
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // 🔹 Crear sesión de Checkout (frontend)
    const body = await req.json().catch(()=>null);
    if (!body) return new Response(JSON.stringify({
      error: "Invalid JSON"
    }), {
      status: 400,
      headers: corsHeaders
    });
    const { line_items, reservas, user_id } = body;
    if (!Array.isArray(line_items) || !Array.isArray(reservas) || !user_id) {
      return new Response(JSON.stringify({
        error: "Bad payload"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        "card"
      ],
      mode: "payment",
      line_items,
      success_url: `http://localhost:9000/AreaPersonal?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:9000/AreaPersonal`,
      metadata: {
        reservas: JSON.stringify(reservas),
        user_id
      }
    });
    return new Response(JSON.stringify({
      url: session.url
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    return new Response(JSON.stringify({
      error: err?.message ?? String(err)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
