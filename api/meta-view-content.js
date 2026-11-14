/*
 * Vercel Serverless Function — Meta Conversions API
 * Envia SOMENTE o evento ViewContent.
 *
 * Secret obrigatória no Vercel:
 *   META_CAPI_ACCESS_TOKEN
 */

const PIXEL_ID = "2348303565735596";
const GRAPH_API_VERSION = "v27.0";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length) return String(forwarded[0]).split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "";
}

function cleanString(value, maxLength = 2048) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("META_CAPI_ACCESS_TOKEN não configurada.");
    return res.status(500).json({ ok: false, error: "Meta CAPI não configurada" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const eventId = cleanString(body.event_id, 200);
  const sourceUrl = cleanString(body.event_source_url, 4096);

  if (!eventId || !sourceUrl) {
    return res.status(400).json({ ok: false, error: "event_id e event_source_url são obrigatórios" });
  }

  const userData = {
    client_ip_address: getClientIp(req),
    client_user_agent: cleanString(req.headers["user-agent"], 1024)
  };

  const fbp = cleanString(body.fbp, 512);
  const fbc = cleanString(body.fbc, 512);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const event = {
    event_name: "ViewContent",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
    custom_data: {
      content_name: cleanString(body.content_name, 500) || "Papeleira Pro 20K"
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] })
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro Meta CAPI:", JSON.stringify(result));
      return res.status(response.status).json({ ok: false, error: "Falha ao enviar evento para a Meta" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, events_received: result.events_received || 0 });
  } catch (error) {
    console.error("Erro ao chamar Meta CAPI:", error);
    return res.status(502).json({ ok: false, error: "Falha de comunicação com a Meta" });
  }
};
