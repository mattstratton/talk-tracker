"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

interface ThresholdSettingsProps {
  initialThreshold: {
    threshold: number;
    description: string;
  };
}

export function ThresholdSettings({
  initialThreshold,
}: ThresholdSettingsProps) {
  const [threshold, setThreshold] = useState(
    initialThreshold.threshold.toString(),
  );
  const utils = api.useUtils();

  const updateThreshold = api.appSettings.updateThreshold.useMutation({
    onSuccess: () => {
      void utils.appSettings.getThreshold.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = parseInt(threshold);
    if (!isNaN(value)) {
      updateThreshold.mutate({ threshold: value });
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-gray-900">
          Scoring Threshold
        </CardTitle>
        <CardDescription>
          Set the minimum score that indicates an event is worth submitting to.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="threshold">Threshold Score</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              max="900"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="max-w-xs"
            />
            <p className="mt-1 text-gray-600 text-sm">
              Events scoring at or above this value will be marked as
              recommended.
            </p>
          </div>
          <Button type="submit" disabled={updateThreshold.isPending}>
            {updateThreshold.isPending ? "Saving..." : "Save Threshold"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
