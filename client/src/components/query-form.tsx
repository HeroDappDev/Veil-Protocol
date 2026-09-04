import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertQuerySchema, type QueryType, type PrivacyLevel, type AiModel } from "@shared/schema";
import { TrendingUp, MessageSquare, Shield, Send, Loader2, Building2, FileText, Globe, ChevronDown } from "lucide-react";
import { InfoTooltip } from "./info-tooltip";
import { PrivacySelector } from "./privacy-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const queryTypes = [
  {
    value: "price_prediction" as const,
    label: "Price Prediction",
    icon: TrendingUp,
    description: "AI-powered cryptocurrency price forecasts",
    placeholder: "ETH/USD",
  },
  {
    value: "sentiment_analysis" as const,
    label: "Sentiment Analysis",
    icon: MessageSquare,
    description: "Social media sentiment and trend analysis",
    placeholder: "Bitcoin",
  },
  {
    value: "risk_assessment" as const,
    label: "Risk Assessment",
    icon: Shield,
    description: "Weather and health risk modeling",
    placeholder: "Hurricane Risk FL",
  },
  {
    value: "rwa_valuation" as const,
    label: "RWA Valuation",
    icon: Building2,
    description: "ZK-attested real-world asset valuation by AI oracle",
    placeholder: "Commercial office tower, Manhattan NY",
  },
  {
    value: "invoice_risk" as const,
    label: "Invoice Risk Score",
    icon: FileText,
    description: "AI-driven risk scoring for invoice financing",
    placeholder: "Net-30 invoice, Healthcare sector, $2.5M",
  },
  {
    value: "compliance_check" as const,
    label: "ZK Compliance Oracle",
    icon: Globe,
    description: "Regulatory compliance attestation without identity disclosure",
    placeholder: "DeFi protocol, MiCA/FATF jurisdiction",
  },
];

interface QueryFormProps {
  onSubmit: (data: {
    type: QueryType;
    target: string;
    parameters: Record<string, any>;
    privacyLevel: PrivacyLevel;
    aiModel: AiModel;
    queryModality: string;
  }) => void;
  isSubmitting?: boolean;
  initialValues?: {
    type?: QueryType;
    target?: string;
    privacyLevel?: PrivacyLevel;
    aiModel?: AiModel;
    queryModality?: string;
  } | null;
}

export function QueryForm({ onSubmit, isSubmitting, initialValues }: QueryFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      insertQuerySchema.extend({
        timeframe: z.string().optional(),
        confidence_threshold: z.number().min(0).max(100).optional(),
      })
    ),
    defaultValues: {
      type: (initialValues?.type ?? "") as QueryType,
      target: initialValues?.target ?? "",
      parameters: {},
      privacyLevel: (initialValues?.privacyLevel ?? "public") as PrivacyLevel,
      aiModel: (initialValues?.aiModel ?? "default") as AiModel,
      queryModality: initialValues?.queryModality ?? "text",
      timeframe: "24h",
      confidence_threshold: 75,
    },
  });

  // Sync the select's displayed value when type is pre-filled
  const watchedType = form.watch("type");
  const currentQueryType = queryTypes.find(qt => qt.value === watchedType);

  const handleSubmit = form.handleSubmit((data) => {
    const { timeframe, confidence_threshold, privacyLevel, aiModel, queryModality, ...base } = data;
    onSubmit({
      ...base,
      privacyLevel: privacyLevel as PrivacyLevel,
      aiModel: aiModel as AiModel,
      queryModality: queryModality || "text",
      parameters: { timeframe, confidence_threshold },
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Query Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
                Query Type
                <InfoTooltip content="Select the type of AI prediction you need. Each type uses specialized models optimized for different data sources." />
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-query-type" className="h-11 font-mono text-sm border-primary/20 bg-black/20 focus:border-primary/50">
                    <SelectValue placeholder="Select query type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="font-mono">
                  {queryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-primary/60" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentQueryType && (
                <FormDescription className="text-[11px] font-mono text-muted-foreground/50">
                  {currentQueryType.description}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target */}
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
                Target / Asset
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={currentQueryType?.placeholder || "Enter target asset or subject"}
                  data-testid="input-target"
                  className="h-11 font-mono text-sm border-primary/20 bg-black/20 focus:border-primary/50 placeholder:text-muted-foreground/30"
                />
              </FormControl>
              <FormDescription className="text-[11px] font-mono text-muted-foreground/50">
                Specify the asset or subject for the oracle query
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Privacy Level */}
        <FormField
          control={form.control}
          name="privacyLevel"
          render={({ field }) => (
            <FormItem>
              <PrivacySelector
                value={field.value as PrivacyLevel}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Advanced Parameters */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-transparent uppercase tracking-wider"
              data-testid="button-advanced-params"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              Advanced Parameters
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs text-muted-foreground/60 uppercase">Timeframe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-timeframe" className="h-10 font-mono text-sm border-primary/20 bg-black/20">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="font-mono">
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confidence_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs text-muted-foreground/60 uppercase">Confidence Threshold (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      min="0"
                      max="100"
                      data-testid="input-confidence"
                      className="h-10 font-mono text-sm border-primary/20 bg-black/20"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] font-mono text-muted-foreground/40">
                    Minimum confidence level for accepting results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Submit */}
        <div className="pt-3 border-t border-primary/10">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            data-testid="button-submit-query"
            className="w-full gap-2 font-mono text-sm uppercase tracking-wider min-h-11"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting to Oracle Network...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Oracle Query
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
