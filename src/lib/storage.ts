import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

const storeRoot = path.resolve(process.cwd(), env.tempDir());

type SessionRecord = {
  id: string;
  original: string;
  simplified: string;
  translations: Record<
    string,
    {
      simplified?: string;
      original?: string;
    }
  >;
  stats: {
    readingLevel?: string;
    wordCount?: number;
  };
  metadata?: Record<string, unknown>;
};

async function ensureStore() {
  await fs.mkdir(storeRoot, { recursive: true });
}

export async function upsertSession(record: SessionRecord) {
  await ensureStore();
  const file = path.join(storeRoot, `${record.id}.json`);
  await fs.writeFile(file, JSON.stringify(record, null, 2), "utf-8");
}

export async function readSession(id: string) {
  try {
    await ensureStore();
    const file = path.join(storeRoot, `${id}.json`);
    const payload = await fs.readFile(file, "utf-8");
    return JSON.parse(payload) as SessionRecord;
  } catch (error) {
    console.error("Unable to read session file", error);
    return null;
  }
}
