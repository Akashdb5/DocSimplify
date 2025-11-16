"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Sun, Moon } from "lucide-react";
import { DocumentUpload, type UploadPayload } from "@/components/workflow/document-upload";
import { ProcessingIndicator } from "@/components/workflow/processing-indicator";
import { ResultViewer } from "@/components/workflow/result-viewer";
import { ChatPanel, type ChatMessage } from "@/components/workflow/chat-panel";
import { ShareCard } from "@/components/workflow/share-card";
import { createPdfFromText } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/i18n-context";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import type { ProcessedDocument } from "@/types/document";

type Stage = "upload" | "processing" | "results";

export default function Home() {
  const { dictionary, t } = useI18n();
  const heroCopy = dictionary.hero;
  const footerCopy = dictionary.footer;
  const [stage, setStage] = useState<Stage>("upload");
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("docsimplify-theme");
    const initial = stored === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("docsimplify-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const handleProcess = async ({ file, domain, languages }: UploadPayload) => {
    try {
      setStage("processing");
      setProcessingStep(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("domain", domain ?? "");
      formData.append("languages", JSON.stringify(languages));

      setProcessingStep(1);
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData
      });
      setProcessingStep(2);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to process document");
      }

      const payload = (await response.json()) as ProcessedDocument;
      setProcessingStep(3);
      setResult(payload);
      setStage("results");
      setChatOpen(false);
      setMessages([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setStage("upload");
      toast.error(message);
    }
  };

  const handleDownload = useCallback(
    async ({ variant, language }: { variant: "simplified" | "translated"; language?: string }) => {
      if (!result) return;
      const text =
        variant === "simplified"
          ? result.simplified
          : language
          ? result.translated[language]?.simplified ?? ""
          : "";
      if (!text) {
        toast.error("Nothing to export yet.");
        return;
      }
      const pdf = await createPdfFromText(
        variant === "simplified" ? "Simplified Document" : `Translation (${language})`,
        text
      );
      const url = URL.createObjectURL(pdf);
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: `docsimplify-${variant}${language ? `-${language}` : ""}.pdf`
      });
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    },
    [result]
  );

  const handleCopyLink = useCallback(() => {
    if (!result) return;
    const url = new URL(window.location.href);
    url.searchParams.set("session", result.sessionId);
    navigator.clipboard.writeText(url.toString());
    toast.success("Secure link copied");
  }, [result]);

  const handleChatSend = useCallback(
    async ({ message, language }: { message: string; language: string }) => {
      if (!result) return;
      const messageId = nanoid();
      const userMessage: ChatMessage = { id: messageId, role: "user", content: message, language };
      setMessages((prev) => [...prev, userMessage]);
      setChatBusy(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: result.sessionId, message, language })
        });
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Chat failed");
        }
        const payload = (await response.json()) as {
          message: string;
          language: string;
          llmQuestion?: string;
          llmAnswer?: string;
        };
        if (payload.llmQuestion) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, llmContent: payload.llmQuestion } : msg))
          );
        }
        const assistant: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: payload.message,
          language: payload.language,
          llmContent: payload.llmAnswer
        };
        setMessages((prev) => [...prev, assistant]);
      } catch (err) {
        const assistant: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Unable to respond.",
          language
        };
        setMessages((prev) => [...prev, assistant]);
      } finally {
        setChatBusy(false);
      }
    },
    [result]
  );

  const heroSubtitle = useMemo(() => heroCopy.subtitle[stage], [heroCopy.subtitle, stage]);

  const defaultChatLanguage = useMemo(() => {
    if (!result) return "en";
    const languages = Object.keys(result.translated ?? {});
    return languages[0] ?? "en";
  }, [result]);

  return (
    <>
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <section className="space-y-6 rounded-3xl border border-border/30 bg-surface/70 p-8 shadow-[0_45px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/40 px-4 py-1 text-xs uppercase tracking-[0.35em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {heroCopy.badge}
            </div>
            <LocaleSwitcher />
            <Button variant="outline" onClick={toggleTheme} className="w-full gap-2 md:w-auto">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-text-primary md:text-5xl">{heroCopy.title}</h1>
            <p className="text-lg text-text-secondary md:text-xl">{heroSubtitle}</p>
          </div>
          <div className="grid gap-4 text-sm text-text-secondary md:grid-cols-3">
            <div className="rounded-2xl border border-border/30 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">Step 1</p>
              <p className="mt-2 text-text-primary">{heroCopy.steps.step1}</p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">Step 2</p>
              <p className="mt-2 text-text-primary">{heroCopy.steps.step2}</p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">Step 3</p>
              <p className="mt-2 text-text-primary">{heroCopy.steps.step3}</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        {stage === "upload" && <DocumentUpload onProcess={handleProcess} disabled={stage !== "upload"} />}

        {stage === "processing" && <ProcessingIndicator currentStage={processingStep} />}

        {stage === "results" && result && (
          <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
            <ResultViewer result={result} onDownload={handleDownload} onStartChat={() => setChatOpen(true)} />
            <div className="space-y-6">
              {chatOpen && (
                <ChatPanel
                  messages={messages}
                  onSend={handleChatSend}
                  busy={chatBusy}
                  defaultLanguage={defaultChatLanguage}
                />
              )}
              <ShareCard
                onExportSummary={() => handleDownload({ variant: "simplified" })}
                onCopyLink={handleCopyLink}
                summary={dictionary.share.summary}
              />
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-border/50 bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
          <p>{footerCopy.builtWith}</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://lingo.dev" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300">
              {footerCopy.links.lingo}
            </a>
            <a
              href="https://github.com/opendocsg/pdf2md"
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:text-brand-300"
            >
              {footerCopy.links.pdf2md}
            </a>
            <span className="text-text-muted">
              {t("footer.copyright", { year: String(new Date().getFullYear()) })}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
