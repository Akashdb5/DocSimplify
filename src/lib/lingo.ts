import "server-only";

import { LingoDotDevEngine } from "lingo.dev/sdk";
import { env } from "@/lib/env";

let sdkPromise: Promise<LingoDotDevEngine> | null = null;

async function getSdk() {
  if (!sdkPromise) {
    sdkPromise = Promise.resolve(
      new LingoDotDevEngine({
        apiKey: env.lingoApiKey()
      })
    );
  }
  return sdkPromise;
}

export async function translateWithLingoCli(text: string, languages: string[]) {
  const client = await getSdk();
  const translations: Record<string, string> = {};

  for (const language of languages) {
    translations[language] = await client.localizeText(text, {
      sourceLocale: "en",
      targetLocale: language
    });
  }

  return translations;
}

export async function translateForChat(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<{ text: string; detectedLanguage: string }> {
  const client = await getSdk();

  let detected = sourceLanguage;

  if (!detected) {
    try {
      detected = await client.recognizeLocale(text);
    } catch (error) {
      console.warn("Unable to detect language with Lingo SDK", error);
    }
  }

  const translated = await client.localizeText(text, {
    sourceLocale: detected ?? null,
    targetLocale: targetLanguage
  });

  return {
    text: translated,
    detectedLanguage: detected ?? targetLanguage
  };
}
