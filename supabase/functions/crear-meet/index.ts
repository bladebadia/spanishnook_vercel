import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fecha, hora, emailCliente, nombreCliente } = await req.json()

    // 1. Obtener Access Token de Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN') ?? '',
        grant_type: 'refresh_token',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      throw new Error('No se pudo obtener acceso a Google Calendar: ' + JSON.stringify(tokenData))
    }

    // 2. Preparar fechas (Asumimos 1h de duración)
    const startDateTime = `${fecha}T${hora}:00`
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().split('.')[0]

    // 3. Crear el evento en Google Calendar
    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Clase Español - ${nombreCliente}`,
          description: `Reserva para ${emailCliente}`,
          start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
          end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' },
          attendees: [{ email: emailCliente }],
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }
    )

    const eventData = await calendarResponse.json()

    // 4. Responder al frontend
    return new Response(
      JSON.stringify({ 
        ok: true, 
        meetLink: eventData.hangoutLink || 'No se generó link',
        eventId: eventData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})