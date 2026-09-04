import { Lock, Eye, UserX } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { type PrivacyLevel } from "@shared/schema";

interface PrivacySelectorProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
}

export function PrivacySelector({ value, onChange }: PrivacySelectorProps) {
  const privacyOptions = [
    {
      value: 'public' as PrivacyLevel,
      icon: Eye,
      label: 'Public',
      description: 'Query and results visible on-chain. Contributes to network statistics.',
      color: 'text-blue-500',
    },
    {
      value: 'private' as PrivacyLevel,
      icon: Lock,
      label: 'Private',
      description: 'Results encrypted with your key. Only you can decrypt and view them.',
      color: 'text-purple-500',
    },
    {
      value: 'anonymous' as PrivacyLevel,
      icon: UserX,
      label: 'Anonymous',
      description: 'No tracking or database storage. Results shown once, then deleted.',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-3" data-testid="privacy-selector">
      <Label className="text-sm font-medium">Privacy Level</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as PrivacyLevel)}>
        <div className="grid gap-3">
          {privacyOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;
            
            return (
              <label
                key={option.value}
                htmlFor={`privacy-${option.value}`}
                className="cursor-pointer"
              >
                <Card
                  className={`p-4 min-h-14 transition-all hover-elevate ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  data-testid={`privacy-option-${option.value}`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={option.value}
                      id={`privacy-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <p className="font-medium text-sm">{option.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </label>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}

