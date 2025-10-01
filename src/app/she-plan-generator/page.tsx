"use client";

import { useState } from "react";
import type { GenerateShePlanOutput } from "@/ai/flows/ai-she-plan-from-prompt";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LoadingDots from "@/components/ui/loading-dots";
import { Separator } from "@/components/ui/separator";

export default function ShePlanGeneratorPage() {
  const [isLoading] = useState(false);
  const [result] = useState<GenerateShePlanOutput | null>(null);

  const normalizeContent = (value: unknown): string => {
    if (Array.isArray(value)) return value.join("\n• ");
    if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
    return String(value ?? "");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* LEFT FORM */}
      <Card className="lg:col-span-2">
        {/* ... form rendering same as before ... */}
      </Card>

      {/* RIGHT RESULT */}
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader>
            <CardTitle>Generated SHE Plan</CardTitle>
            <CardDescription>Review the AI-generated plan below.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4 text-sm">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-semibold text-base">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </h3>
                    <Separator className="my-1" />
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {normalizeContent(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
