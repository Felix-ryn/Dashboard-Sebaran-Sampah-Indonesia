import { askGemini, GeminiError } from "@/lib/chat/gemini";
import { QUICK_QUESTIONS } from "@/lib/chat/quick";
import type { ChatMessage } from "@/lib/chat/types";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 10;
const RATE_LIMIT = 12; // permintaan per menit per alamat IP (upaya terbaik di serverless)
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > RATE_LIMIT;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
  if (limited(ip)) {
    return json(
      { reply: "Terlalu banyak pertanyaan dalam waktu singkat. Tunggu sebentar lalu coba lagi.", actions: [] },
      429,
    );
  }

  let body: { messages?: ChatMessage[]; quick?: string };
  try {
    body = await request.json();
  } catch {
    return json({ reply: "Permintaan tidak valid.", actions: [] }, 400);
  }

  // Pertanyaan contoh: dihitung langsung dari data, tanpa AI
  if (body.quick) {
    const item = QUICK_QUESTIONS.find((q) => q.id === body.quick);
    if (!item) return json({ reply: "Pertanyaan contoh tidak dikenal.", actions: [] }, 400);
    return json(item.answer());
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ reply: "Tuliskan pertanyaan Anda terlebih dahulu.", actions: [] }, 400);
  }

  try {
    const result = await askGemini(messages, AbortSignal.timeout(25_000));
    return json({ ...result, source: "ai" });
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    if (process.env.NODE_ENV !== "production") console.error("[chat]", error);
    const notConfigured = error instanceof GeminiError && error.message.includes("Kunci");
    const reply =
      status === 429
        ? "Kuota AI sedang penuh. Coba lagi sebentar, atau pilih salah satu pertanyaan contoh yang dijawab langsung dari data."
        : notConfigured
          ? "Layanan AI belum dikonfigurasi. Pilih salah satu pertanyaan contoh, yang tetap bisa dijawab dari data."
          : "Layanan AI sedang bermasalah. Pilih salah satu pertanyaan contoh, yang tetap bisa dijawab dari data.";
    return json({ reply, actions: [], source: "cepat" });
  }
}
