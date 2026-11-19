const SITE_ORIGIN = "https://h2650368-ai.github.io";
const MODEL = "gpt-6-luna";

function cors(origin) {
  const allowed = origin === SITE_ORIGIN ? origin : SITE_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store" }
  });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") return json({ error: "Not found" }, 404, origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
    if (origin !== SITE_ORIGIN) return json({ error: "Origin not allowed" }, 403, origin);
    if (!env.OPENAI_API_KEY) return json({ error: "AI service is not configured" }, 503, origin);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Invalid JSON" }, 400, origin); }

    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) {
      return json({ error: "Send between 1 and 12 messages" }, 400, origin);
    }
    const messages = [];
    for (const item of body.messages) {
      if (!item || !["user", "assistant"].includes(item.role) ||
          typeof item.content !== "string" || !item.content.trim() || item.content.length > 4000) {
        return json({ error: "Invalid message format" }, 400, origin);
      }
      messages.push({ role: item.role, content: item.content.trim() });
    }
    if (messages[messages.length - 1].role !== "user") {
      return json({ error: "The last message must be from the user" }, 400, origin);
    }

    try {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          instructions: "You are PERSONAL AI inside MY UNIVERSE. Be helpful, clear, friendly, and concise. Reply in the language used by the user. Help with learning, planning, writing, and organizing ideas. Do not claim to remember information outside the messages provided.",
          input: messages,
          max_output_tokens: 600
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) {
        return json({ error: "The AI provider could not complete the request" }, 502, origin);
      }
      let reply = result.output_text || "";
      if (!reply && Array.isArray(result.output)) {
        reply = result.output.flatMap(x => x.content || [])
          .filter(x => x.type === "output_text").map(x => x.text).join("\n");
      }
      if (!reply) return json({ error: "Empty AI response" }, 502, origin);
      return json({ reply }, 200, origin);
    } catch {
      return json({ error: "AI service temporarily unavailable" }, 502, origin);
    }
  }
};
