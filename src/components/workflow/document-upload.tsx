import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/components/i18n/i18n-context";

export type UploadPayload = {
  file: File;
  domain?: string;
  languages: string[];
};

type DocumentUploadProps = {
  onProcess: (payload: UploadPayload) => Promise<void> | void;
  disabled?: boolean;
};

export function DocumentUpload({ onProcess, disabled }: DocumentUploadProps) {
  const { dictionary } = useI18n();
  const copy = dictionary.upload;
  const domainOptions = Object.entries(copy.domainOptions as Record<string, string>);
  const languageOptions = Object.entries(copy.languageOptions as Record<string, string>);
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("legal");
  const [language, setLanguage] = useState("hi");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    await onProcess({
      file,
      domain,
      languages: language && language !== "none" ? [language] : []
    });
  };

  return (
    <Card className="gradient-border bg-surface/80">
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-text-muted">{copy.eyebrow}</p>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-dashed border-border/40 bg-card/80 p-6 text-center">
          <label className="flex cursor-pointer flex-col items-center gap-3">
            <UploadCloud className="h-12 w-12 text-brand-400" />
            <div>
              <p className="text-base font-semibold text-text-primary">{copy.dropTitle}</p>
              <p className="text-sm text-text-secondary">{copy.dropHint}</p>
            </div>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              required
              disabled={disabled}
              onChange={(event) => {
                if (!event.target.files?.length) return;
                setFile(event.target.files[0]);
              }}
              className="hidden"
            />
          </label>
          {file && <p className="mt-4 text-sm text-text-secondary">Selected: {file.name}</p>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-secondary">{copy.domainLabel}</Label>
            <Select value={domain} onValueChange={setDomain} disabled={disabled}>
              <SelectTrigger className="bg-card border-border/40">
                <SelectValue placeholder={copy.domainLabel} />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-text-secondary">{copy.targetLabel}</Label>
            <Select value={language} onValueChange={setLanguage} disabled={disabled}>
              <SelectTrigger className="bg-card border-border/40">
                <SelectValue placeholder={copy.targetLabel} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border border-border/30 bg-canvas/40 p-4 text-left">
          <p className="text-sm font-semibold text-text-primary">{copy.whatNextTitle}</p>
          <ol className="mt-3 space-y-2 text-sm text-text-secondary marker:text-brand-400 list-decimal list-inside">
            {copy.whatNextList.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <Button type="submit" disabled={!file || disabled} className="w-full lg:w-auto lg:px-10">
          {copy.submit}
        </Button>
      </form>
    </Card>
  );
}
