import { Loader2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/i18n/i18n-context";

type ProcessingIndicatorProps = {
  stages?: string[];
  currentStage: number;
  tip?: string;
};

export function ProcessingIndicator({ stages, currentStage, tip }: ProcessingIndicatorProps) {
  const { dictionary } = useI18n();
  const copy = dictionary.processing;
  const stageList = stages ?? copy.stages;
  const tipText = tip ?? copy.tip;
  const progressValue = Math.round(((currentStage + 1) / stageList.length) * 100);

  return (
    <Card className="bg-surface/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <Progress value={progressValue} />
        <div className="space-y-3">
          {stageList.map((stage: string, index: number) => {
            const isActive = index === currentStage;
            const complete = index < currentStage;
            return (
              <div key={stage} className="flex items-center justify-between rounded-xl border border-border/30 bg-card/70 p-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{stage}</p>
                  {isActive && <p className="text-xs text-text-secondary">{copy.status.hint}</p>}
                </div>
                <Badge variant={complete ? "success" : isActive ? "warning" : "default"}>
                  {complete ? copy.status.done : isActive ? copy.status.running : copy.status.pending}
                </Badge>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-text-secondary">{tipText}</p>
      </div>
    </Card>
  );
}
