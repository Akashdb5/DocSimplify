import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/components/i18n/i18n-context";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  llmContent?: string;
};

type ChatPanelProps = {
  messages: ChatMessage[];
  onSend: (payload: { message: string; language: string }) => Promise<void>;
  defaultLanguage?: string;
  busy?: boolean;
};

const supportedLanguages = [
  { label: "Arabic", value: "ar" },
  { label: "Bengali", value: "bn" },
  { label: "Chinese (Simplified)", value: "zh-Hans" },
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Hebrew", value: "he" },
  { label: "Hindi", value: "hi" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Marathi", value: "mr" },
  { label: "Odia", value: "or" },
  { label: "Persian", value: "fa" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "Russian", value: "ru" },
  { label: "Spanish", value: "es" },
  { label: "Turkish", value: "tr" },
  { label: "Ukrainian", value: "uk-UA" }
];

export function ChatPanel({ messages, onSend, defaultLanguage = "en", busy }: ChatPanelProps) {
  const { dictionary } = useI18n();
  const copy = dictionary.chat;
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    await onSend({ message: input.trim(), language });
    setInput("");
  };

  return (
    <Card className="bg-surface/80">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div
          className="h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-border/30 bg-canvas/40 p-4"
          ref={scrollRef}
        >
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={[
                  "max-w-3xl rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isUser
                    ? "ml-auto border border-brand-500/30 bg-brand-500/15 text-right"
                    : "mr-auto border border-border/30 bg-card/70"
                ].join(" ")}
              >
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  {(isUser ? copy.badges.you : copy.badges.assistant) + " · " + message.language.toUpperCase()}
                </p>
                <p className="mt-1 text-text-primary">{message.content}</p>
                {message.llmContent && (
                  <p className="mt-2 rounded-lg bg-surface/80 p-2 text-xs text-text-secondary">
                    {(message.role === "user" ? copy.badges.llmReceived : copy.badges.llmResponse) + ": " + message.llmContent}
                  </p>
                )}
              </div>
            );
          })}
          {messages.length === 0 && (
            <p className="text-center text-sm text-text-muted">{copy.empty}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy.placeholder}
            disabled={busy}
            className="min-h-[120px] w-full rounded-2xl border border-border/40 bg-card/70 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
          <div className="flex flex-col gap-3 md:flex-row">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="md:w-64">
                <SelectValue placeholder={copy.selectLabel} />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full md:w-44" disabled={busy || input.trim().length === 0}>
              <Send className="mr-2 h-4 w-4" />
              {copy.send}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
