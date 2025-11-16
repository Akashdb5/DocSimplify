import { PDFDocument, StandardFonts } from "pdf-lib";

function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function createPdfFromText(title: string, content: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  let page = doc.addPage();
  let y = page.getHeight() - margin;
  const maxWidth = page.getWidth() - margin * 2;

  const drawLine = (line: string) => {
    if (y <= margin) {
      page = doc.addPage();
      y = page.getHeight() - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font });
    y -= fontSize + 4;
  };

  page.drawText(title, { x: margin, y, size: 18, font });
  y -= 24;

  content.split("\n").forEach((paragraph) => {
    const lines = wrapText(paragraph, font, fontSize, maxWidth);
    lines.forEach((line) => drawLine(line));
    y -= fontSize;
  });

  const bytes = await doc.save();
  // Create a new ArrayBuffer and copy the data to ensure proper typing
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(new Uint8Array(bytes));
  return new Blob([buffer], { type: "application/pdf" });
}
