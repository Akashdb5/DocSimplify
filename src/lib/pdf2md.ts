import "server-only";

import pdf2md from "@opendocsg/pdf2md";

type PdfMetadataInfo = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
};

export type Pdf2MdMetadata = Record<string, unknown> & {
  fileName: string;
  provider: "pdf2md";
  pageCount?: number;
  info?: PdfMetadataInfo;
};

export type Pdf2MdResult = {
  text: string;
  metadata: Pdf2MdMetadata;
};

const PDF_MAGIC_HEADER = "%PDF-";

function isPdf(buffer: Buffer) {
  if (!buffer || buffer.byteLength < PDF_MAGIC_HEADER.length) {
    return false;
  }
  const signature = buffer.subarray(0, PDF_MAGIC_HEADER.length).toString("ascii");
  return signature.startsWith(PDF_MAGIC_HEADER);
}

export async function parseDocumentWithPdf2Md(file: Buffer, filename: string): Promise<Pdf2MdResult> {
  if (!file?.byteLength) {
    throw new Error("Uploaded file is empty");
  }

  if (!isPdf(file)) {
    throw new Error("Only PDF files are supported at the moment");
  }

  let pageCount: number | undefined;
  let rawInfo: Record<string, unknown> | undefined;

  const markdown = await pdf2md(file, {
    metadataParsed(metadata) {
      rawInfo = metadata?.info as Record<string, unknown> | undefined;
    },
    documentParsed(document) {
      pageCount = document?.numPages;
    }
  });

  const text = markdown.trim();
  if (!text) {
    throw new Error("Unable to extract text from the uploaded PDF");
  }

  return {
    text,
    metadata: {
      fileName: filename,
      provider: "pdf2md",
      pageCount,
      info: normalizeMetadata(rawInfo)
    }
  };
}

function normalizeMetadata(info?: Record<string, unknown>): PdfMetadataInfo | undefined {
  if (!info) return undefined;

  const normalized: PdfMetadataInfo = {
    title: getString(info.Title ?? info.title),
    author: getString(info.Author ?? info.author),
    subject: getString(info.Subject ?? info.subject),
    keywords: getString(info.Keywords ?? info.keywords),
    creator: getString(info.Creator ?? info.creator),
    producer: getString(info.Producer ?? info.producer),
    creationDate: getString(info.CreationDate ?? info.creationDate),
    modificationDate: getString(info.ModDate ?? info.modDate ?? info.ModificationDate ?? info.modificationDate)
  };

  const entries = Object.entries(normalized).filter(([, value]) => Boolean(value));
  return entries.length > 0 ? (Object.fromEntries(entries) as PdfMetadataInfo) : undefined;
}

function getString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
