import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/storage";
import { translateForChat } from "@/lib/lingo";
import { answerDocumentQuestion } from "@/lib/llm";

const bodySchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
  language: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const session = await readSession(body.sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const translatedQuestion = await translateForChat(body.message, "en", body.language);
    const context = ["Original Document:", session.original, "Simplified Document:", session.simplified].join(
      "\n\n"
    );

    const answer = await answerDocumentQuestion({
      question: translatedQuestion.text,
      context,
      language: "en"
    });

    const responseLanguage = body.language ?? translatedQuestion.detectedLanguage;
    const localized = await translateForChat(answer, responseLanguage, "en");

    return NextResponse.json({
      language: responseLanguage,
      message: localized.text,
      llmQuestion: translatedQuestion.text,
      llmAnswer: answer
    });
  } catch (error) {
    console.error("Chat error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
