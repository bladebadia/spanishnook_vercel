import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
 "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
 return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
 return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
 if (!supabaseUrl || !serviceRoleKey) {
 return new Response(JSON.stringify({ error: "Configuración del servidor incompleta" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
 const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: getUserErr } = await admin.auth.getUser(token);
 if (getUserErr || !userData?.user?.id) {
 return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
 const userId = userData.user.id;
 const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
 return new Response(JSON.stringify({ error: delErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
 return new Response(JSON.stringify({ message: "Cuenta eliminada" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});