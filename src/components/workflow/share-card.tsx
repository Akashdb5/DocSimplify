import { Share, FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/i18n-context";

type ShareCardProps = {
  onExportSummary: () => void;
  onCopyLink: () => void;
  summary?: string;
};

export function ShareCard({ onExportSummary, onCopyLink, summary }: ShareCardProps) {
  const { dictionary } = useI18n();
  const copy = dictionary.share;
  const note = summary ?? copy.summary;

  return (
    <Card className="bg-surface/80">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        <Button className="w-full" variant="outline" onClick={onExportSummary}>
          <FileText className="mr-2 h-4 w-4" />
          {copy.export}
        </Button>
        <Button className="w-full" variant="outline" onClick={onCopyLink}>
          <Share className="mr-2 h-4 w-4" />
          {copy.copy}
        </Button>
        {note && <p className="text-sm text-text-secondary">{note}</p>}
      </div>
    </Card>
  );
}
