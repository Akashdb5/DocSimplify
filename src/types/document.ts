export type DocumentTranslations = {
  simplified?: string;
  original?: string;
};

export type ProcessedDocument = {
  sessionId: string;
  original: string;
  simplified: string;
  translated: Record<string, DocumentTranslations>;
  stats: {
    readingLevel?: string;
    wordCount?: number;
  };
  metadata?: Record<string, unknown>;
};
