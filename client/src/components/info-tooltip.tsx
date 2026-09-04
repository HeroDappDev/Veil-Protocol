import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface InfoTooltipProps {
  content: string;
  learnMoreUrl?: string;
}

export function InfoTooltip({ content, learnMoreUrl }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          data-testid="button-info"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm">
        <p className="text-xs leading-relaxed">{content}</p>
        {learnMoreUrl && (
          <a
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            Learn More →
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

