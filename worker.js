const ALLOWED_ORIGINS = new Set(["https://h2650368-ai.github.io", "capacitor://localhost", "http://localhost", "https://localhost"]);
const TEXT_MODEL = "gpt-6-luna";
const REALTIME_MODEL = "gpt-realtime-2.1";

const PERSONA = "أنت المساعد الشخصي داخل MY UNIVERSE. اتكلم بالمصري البسيط لما المستخدم يتكلم بالمصري، وخليك مباشر وودود ومن غير مبالغة أو مجاملات مصطنعة. افهم أسلوبه تدريجيًا من الرسائل المتاحة، لكن لا تدّعي إنك تعرفه خارج المعلومات التي يشاركها أو إنك تحفظ كل شيء تلقائيًا. لا تحفظ أي معلومة شخصية في ذاكرة دائمة إلا بموافقة صريحة من المستخدم. وضّح أنك ذكاء اصطناعي ولست إنسانًا. احترم الخصوصية، ولا تطلب كلمات مرور أو مفاتيح سرية.";

function cors(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://h2650368-ai.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function cleanMemories(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).filter(x => typeof x === "string")
    .map(x => x.trim().slice(0, 500)).filter(Boolean);
}
function withMemories(persona, memories) {
  if (!memories.length) return persona;
  return persona + "\n\nمعلومات وافق المستخدم على حفظها:\n- " +
    memories.join("\n- ") +
    "\nاستخدمها فقط عندما تفيد الرد، ولا تفترض معلومات أخرى عنها.";
}
function validOrigin(request) {
  return ALLOWED_ORIGINS.has(request.headers.get("Origin") || "");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "MY UNIVERSE AI", configured: Boolean(env.OPENAI_API_KEY) }, 200, origin);
    }
    if (!["/api/chat", "/api/realtime-token"].includes(url.pathname)) {
      return json({ error: "Not found" }, 404, origin);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
    if (!validOrigin(request)) return json({ error: "Origin not allowed" }, 403, origin);
    if (!env.OPENAI_API_KEY) return json({ error: "الخادم شغال لكن مفتاح الخدمة غير مضبوط في Cloudflare (OPENAI_API_KEY)." }, 503, origin);

    if (url.pathname === "/api/realtime-token") {
      let voiceBody = {};
      try { voiceBody = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
      const instructions = withMemories(PERSONA, cleanMemories(voiceBody.memories));
      try {
        const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + env.OPENAI_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            expires_after: { anchor: "created_at", seconds: 600 },
            session: {
              type: "realtime",
              model: REALTIME_MODEL,
              instructions,
              output_modalities: ["audio"],
              audio: {
                input: { turn_detection: { type: "server_vad" } },
                output: { voice: "marin" }
              }
            }
          })
        });
        const result = await upstream.json();
        if (!upstream.ok || !result.value) {
          return json({ error: "Could not create a voice session. Check the API project and model access." }, 502, origin);
        }
        return json({ token: result.value, expires_at: result.expires_at, model: REALTIME_MODEL }, 200, origin);
      } catch {
        return json({ error: "Voice service temporarily unavailable" }, 502, origin);
      }
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Invalid JSON" }, 400, origin); }

    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) {
      return json({ error: "Send between 1 and 12 messages" }, 400, origin);
    }
    const messages = [];
    for (const item of body.messages) {
      if (!item || !["user", "assistant"].includes(item.role)) return json({ error: "Invalid message format" }, 400, origin);
      if (typeof item.content === "string") {
        if (!item.content.trim() || item.content.length > 4000) return json({ error: "Invalid message content" }, 400, origin);
        messages.push({ role: item.role, content: item.content.trim() });
        continue;
      }
      if (item.role !== "user" || !Array.isArray(item.content) || item.content.length < 1 || item.content.length > 8) return json({ error: "Invalid attachment message" }, 400, origin);
      const parts = [];
      for (const part of item.content) {
        if (part?.type === "input_text" && typeof part.text === "string" && part.text.trim() && part.text.length <= 50000) parts.push({ type: "input_text", text: part.text });
        else if (part?.type === "input_image" && typeof part.image_url === "string" && /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(part.image_url) && part.image_url.length <= 12000000) parts.push({ type: "input_image", image_url: part.image_url });
        else if (part?.type === "input_file" && typeof part.filename === "string" && part.filename.toLowerCase().endsWith(".pdf") && typeof part.file_data === "string" && /^data:application\/pdf;base64,/i.test(part.file_data) && part.file_data.length <= 12000000) parts.push({ type: "input_file", filename: part.filename.slice(0,120), file_data: part.file_data });
        else return json({ error: "Unsupported or oversized attachment" }, 400, origin);
      }
      messages.push({ role: item.role, content: parts });
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
          model: TEXT_MODEL,
          instructions: withMemories(PERSONA, cleanMemories(body.memories)),
          input: messages,
          max_output_tokens: 600
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) return json({ error: "رفض مزود الذكاء الاصطناعي الطلب", provider_status: upstream.status, provider_code: result?.error?.code || result?.error?.type || "unknown" }, 502, origin);
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
