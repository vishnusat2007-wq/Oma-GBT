import { generateOmaReply, type ChatMessage } from "@/lib/oma";

interface ChatRequestBody {
  messages?: ChatMessage[];
}

const VALID_ROLES = new Set(["user", "assistant", "system"]);

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "`messages` must be a non-empty array" },
      { status: 400 },
    );
  }

  const isValid = messages.every(
    (m) =>
      m &&
      typeof m.content === "string" &&
      typeof m.role === "string" &&
      VALID_ROLES.has(m.role),
  );
  if (!isValid) {
    return Response.json(
      { error: "Each message needs a valid `role` and string `content`" },
      { status: 400 },
    );
  }

  const { reply, source } = await generateOmaReply(messages);
  return Response.json({ reply, source });
}

export async function GET() {
  return Response.json({
    status: "ok",
    service: "oma-gbt",
    hint: "POST { messages: [{ role, content }] } to chat with Oma.",
  });
}
