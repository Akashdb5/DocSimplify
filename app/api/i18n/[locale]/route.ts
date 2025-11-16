import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET(_: Request, { params }: { params: { locale: string } }) {
  const file = path.join(process.cwd(), "i18n", `${params.locale}.json`);
  try {
    const data = await fs.readFile(file, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Unable to load locale file", params.locale, error);
    return NextResponse.json({ error: "Locale not available" }, { status: 404 });
  }
}
