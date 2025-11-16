import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { parseDocumentWithPdf2Md } from "@/lib/pdf2md";
import { simplifyDocumentText } from "@/lib/llm";
import { translateWithLingoCli } from "@/lib/lingo";
import { upsertSession } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file upload" }, { status: 400 });
    }

    const domain = formData.get("domain")?.toString();
    const languagesInput = formData.get("languages")?.toString();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const parsedDocument = await parseDocumentWithPdf2Md(fileBuffer, file.name);
    const simplified = await simplifyDocumentText(parsedDocument.text, domain);
    console.info("[process] Parsed markdown", {
      chars: parsedDocument.text.length,
      preview: parsedDocument.text.slice(0, 500)
    });

    const parsedLanguages: string[] = (() => {
      if (!languagesInput) return ["en"]; // ensures object not empty
      try {
        const value = JSON.parse(languagesInput);
        return Array.isArray(value) ? value.filter((lang) => typeof lang === "string") : [];
      } catch {
        return languagesInput.split(",").map((lang) => lang.trim());
      }
    })();

    const languages = parsedLanguages.filter((lang) => lang && lang !== "en");

    type LanguageTranslations = Record<
      string,
      {
        simplified?: string;
        original?: string;
      }
    >;
    let translations: LanguageTranslations = {};

    if (languages.length > 0) {
      const simplifiedTranslations = await translateWithLingoCli(simplified.simplified, languages);
      const originalTranslations = await translateWithLingoCli(parsedDocument.text, languages);

      translations = languages.reduce<LanguageTranslations>((acc, lang) => {
        acc[lang] = {
          simplified: simplifiedTranslations[lang],
          original: originalTranslations[lang]
        };
        return acc;
      }, {});
    }

    const stats = {
      readingLevel: simplified.reading_level,
      wordCount: simplified.word_count
    };

    const sessionId = nanoid();
    await upsertSession({
      id: sessionId,
      original: parsedDocument.text,
      simplified: simplified.simplified,
      translations,
      stats,
      metadata: parsedDocument.metadata
    });

    return NextResponse.json({
      sessionId,
      original: parsedDocument.text,
      simplified: simplified.simplified,
      translated: translations,
      stats
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Process error", message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
