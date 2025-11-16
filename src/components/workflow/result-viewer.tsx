import { useMemo, useState } from "react";
import { Download, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/components/i18n/i18n-context";
import type { ProcessedDocument } from "@/types/document";

type ResultViewerProps = {
  result: ProcessedDocument;
  onDownload: (options: { variant: "simplified" | "translated"; language?: string }) => void;
  onStartChat: () => void;
};

const localeLabels: Record<string, string> = {
  ar: "Arabic",
  bn: "Bengali",
  de: "German",
  en: "English",
  es: "Spanish",
  fa: "Persian",
  fr: "French",
  he: "Hebrew",
  hi: "Hindi",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  mr: "Marathi",
  or: "Odia",
  "pt-BR": "Portuguese (Brazil)",
  pl: "Polish",
  ru: "Russian",
  tr: "Turkish",
  "uk-UA": "Ukrainian",
  "zh-Hans": "Chinese (Simplified)"
};

export function ResultViewer({ result, onDownload, onStartChat }: ResultViewerProps) {
  const { dictionary, t } = useI18n();
  const copy = dictionary.results;
  const translations = Object.entries(result.translated);
  const [selectedLanguage, setSelectedLanguage] = useState(translations[0]?.[0]);
  const simplifiedTranslation = selectedLanguage ? result.translated[selectedLanguage]?.simplified : undefined;
  const originalTranslation = selectedLanguage ? result.translated[selectedLanguage]?.original : undefined;
  const stats = useMemo(
    () => [
      { label: copy.stats.readingLevel, value: result.stats.readingLevel ?? "N/A" },
      { label: copy.stats.wordCount, value: result.stats.wordCount ?? "N/A" }
    ],
    [copy.stats.readingLevel, copy.stats.wordCount, result.stats]
  );
  const downloadLabel =
    selectedLanguage &&
    t("results.buttons.downloadTranslation", {
      language: localeLabels[selectedLanguage] ?? selectedLanguage
    });

  return (
    <Card className="bg-surface/80">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => onDownload({ variant: "simplified" })}>
            <Download className="mr-2 h-4 w-4" />
            {copy.buttons.downloadSimplified}
          </Button>
          {selectedLanguage && (
            <Button
              variant="outline"
              onClick={() => onDownload({ variant: "translated", language: selectedLanguage })}
              disabled={!simplifiedTranslation}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloadLabel}
            </Button>
          )}
          <Button onClick={onStartChat}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {copy.buttons.chat}
          </Button>
        </div>
      </CardHeader>

      <Tabs defaultValue="original" className="space-y-4">
        <TabsList className="w-full justify-start gap-2 overflow-x-auto rounded-2xl bg-card/60 p-2">
          <TabsTrigger value="original">{copy.tabs.original}</TabsTrigger>
          <TabsTrigger value="original-translated">{copy.tabs.originalTranslation}</TabsTrigger>
          <TabsTrigger value="simplified">{copy.tabs.simplified}</TabsTrigger>
          <TabsTrigger value="translated">{copy.tabs.simplifiedTranslation}</TabsTrigger>
        </TabsList>

        <TabsContent value="original">
          <DocSection text={result.original} />
        </TabsContent>
        <TabsContent value="original-translated">
          {translations.length === 0 ? (
            <p className="text-sm text-text-secondary">{copy.emptyTranslations}</p>
          ) : (
            <div className="space-y-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary.upload.targetLabel} />
                </SelectTrigger>
                <SelectContent>
                  {translations.map(([code]) => (
                    <SelectItem key={code} value={code}>
                      {localeLabels[code] ?? code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLanguage && originalTranslation ? (
                <DocSection text={originalTranslation} language={selectedLanguage} />
              ) : (
                <p className="text-sm text-text-secondary">{copy.missingOriginal}</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="simplified">
          <DocSection text={result.simplified} stats={stats} />
        </TabsContent>
        <TabsContent value="translated">
          {translations.length === 0 ? (
            <p className="text-sm text-text-secondary">{copy.emptyTranslations}</p>
          ) : (
            <div className="space-y-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary.upload.targetLabel} />
                </SelectTrigger>
                <SelectContent>
                  {translations.map(([code]) => (
                    <SelectItem key={code} value={code}>
                      {localeLabels[code] ?? code.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLanguage && simplifiedTranslation ? (
                <DocSection text={simplifiedTranslation} language={selectedLanguage} />
              ) : (
                <p className="text-sm text-text-secondary">{copy.missingSimplified}</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

type DocSectionProps = {
  text: string;
  stats?: { label: string; value: string | number }[];
  language?: string;
};

function DocSection({ text, stats, language }: DocSectionProps) {
  const { dictionary } = useI18n();
  const labels = dictionary.results.stats;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {stats?.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/30 bg-card/70 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
        {language && (
          <div className="rounded-xl border border-border/30 bg-card/70 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{labels.language}</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{language.toUpperCase()}</p>
          </div>
        )}
      </div>
      <ScrollArea className="h-[320px] rounded-2xl border border-border/30 bg-canvas/40 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{text}</p>
      </ScrollArea>
    </div>
  );
}
