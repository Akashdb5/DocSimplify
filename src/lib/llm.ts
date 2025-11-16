import "server-only";

import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/lib/env";

const client = new OpenAI({ apiKey: env.openAiApiKey() });

const simplifySchema = z.object({
  simplified: z.string(),
  reading_level: z.string().optional(),
  word_count: z.number().optional(),
  glossary: z.array(z.object({ term: z.string(), definition: z.string() })).optional()
});

const completionJsonSchema = {
  name: "document_simplification",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["simplified"],
    properties: {
      simplified: { type: "string", description: "Plain-language rewrite of the source material" },
      reading_level: { type: "string", description: "Approximate US grade-level or CEFR descriptor" },
      word_count: { type: "number", description: "Word count of the simplified text" },
      glossary: {
        type: "array",
        description: "Optional glossary of critical terms and their definitions",
        items: {
          type: "object",
          required: ["term", "definition"],
          additionalProperties: false,
          properties: {
            term: { type: "string" },
            definition: { type: "string" }
          }
        }
      }
    }
  },
  strict: false
} as const;

export type SimplifyResult = z.infer<typeof simplifySchema>;

export async function simplifyDocumentText(text: string, domain?: string): Promise<SimplifyResult> {
  const systemPrompt = [
    "You simplify complex legal, medical, finance, and regulatory documents.",
    "Return JSON with simplified text, reading level, word count, and optional glossary."
  ].join(" ");

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_RESPONSE_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Domain: ${domain ?? "general"}\n\nText:\n${text}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: completionJsonSchema
    },
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM simplify response malformed");
  }

  const normalized = normalizeSimplifyPayload(JSON.parse(content));
  return simplifySchema.parse(normalized);
}

function normalizeSimplifyPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const draft = payload as Record<string, unknown>;
  const glossary = normalizeGlossary(draft.glossary);
  const wordCount = normalizeNumber(draft.word_count);

  return {
    ...draft,
    glossary,
    word_count: wordCount
  };
}

function normalizeGlossary(value: unknown) {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is { term: string; definition: string } =>
        Boolean(entry) &&
        typeof entry === "object" &&
        typeof (entry as { term?: unknown }).term === "string" &&
        typeof (entry as { definition?: unknown }).definition === "string"
    );
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, definition]) => typeof definition === "string")
      .map(([term, definition]) => ({ term, definition: definition as string }));
  }

  return undefined;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

type QuestionPayload = {
  question: string;
  context: string;
  language: string;
};

export async function answerDocumentQuestion(payload: QuestionPayload): Promise<string> {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a multilingual legal assistant. Always answer using the caller provided language while referencing document context."
      },
      {
        role: "user",
        content: [
          `Language: ${payload.language}`,
          `Context:\n${payload.context}`,
          `Question:\n${payload.question}`
        ].join("\n\n")
      }
    ],
    temperature: 0.7
  });

  const message = response.choices[0]?.message?.content;
  if (!message) {
    throw new Error("LLM chat response malformed");
  }

  return message;
}
