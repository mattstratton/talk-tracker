"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface EventScoringProps {
  eventId: number;
  eventName: string;
}

export function EventScoring({ eventId, eventName }: EventScoringProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  // Fetch categories and existing scores
  const { data: categories = [] } = api.scoringCategory.getAll.useQuery();
  const { data: summary } = api.eventScore.getSummary.useQuery({ eventId });
  const { data: threshold } = api.appSettings.getThreshold.useQuery();

  // Form state: map of categoryId to { score, notes }
  const [formData, setFormData] = useState<
    Record<number, { score: string; notes: string }>
  >({});

  // Initialize form data from existing scores
  useEffect(() => {
    if (summary?.scores) {
      const initial: Record<number, { score: string; notes: string }> = {};
      for (const score of summary.scores) {
        initial[score.categoryId] = {
          score: score.score.toString(),
          notes: score.notes ?? "",
        };
      }
      setFormData(initial);
    }
  }, [summary]);

  const upsertBatch = api.eventScore.upsertBatch.useMutation({
    onSuccess: () => {
      void utils.eventScore.getSummary.invalidate({ eventId });
      void utils.eventScore.getByEvent.invalidate({ eventId });
      setOpen(false);
    },
  });

  const handleScoreChange = (categoryId: number, score: string) => {
    setFormData((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        score,
        notes: prev[categoryId]?.notes ?? "",
      },
    }));
  };

  const handleNotesChange = (categoryId: number, notes: string) => {
    setFormData((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        notes,
        score: prev[categoryId]?.score ?? "",
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const scores = Object.entries(formData)
      .filter(([_, data]) => data.score !== "")
      .map(([categoryId, data]) => ({
        categoryId: parseInt(categoryId),
        score: data.score as "0" | "1" | "3" | "9",
        notes: data.notes || undefined,
      }));

    upsertBatch.mutate({
      eventId,
      scores,
    });
  };

  const getCategoryScore = (categoryId: number) => {
    return formData[categoryId]?.score ?? "";
  };

  const getCategoryNotes = (categoryId: number) => {
    return formData[categoryId]?.notes ?? "";
  };

  const getScoreDescription = (category: any, score: string) => {
    switch (score) {
      case "9":
        return category.score9Description;
      case "3":
        return category.score3Description;
      case "1":
        return category.score1Description;
      case "0":
        return category.score0Description;
      default:
        return "";
    }
  };

  if (categories.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-8 text-center">
          <p className="mb-4 text-gray-600">
            No scoring categories configured. Visit Settings to set up scoring.
          </p>
          <Link href="/settings">
            <Button>Go to Settings</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-gray-900">
          Event Score
        </CardTitle>
        <CardDescription>
          Evaluate this event using the scoring matrix.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summary && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-600 text-sm">
                    Total Score
                  </p>
                  <p className="font-bold text-3xl text-gray-900">
                    {summary.totalScore}
                    <span className="text-gray-400 text-lg">
                      {" "}
                      / {summary.maxScore}
                    </span>
                  </p>
                  <p className="mt-1 text-gray-600 text-sm">
                    {summary.completionCount} of {summary.totalCategories}{" "}
                    categories scored
                  </p>
                </div>
                {threshold && (
                  <div className="text-right">
                    <p className="font-medium text-gray-600 text-sm">Status</p>
                    <div
                      className={`mt-1 inline-block rounded px-3 py-1 font-semibold text-sm ${
                        summary.totalScore >= threshold.threshold
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {summary.totalScore >= threshold.threshold
                        ? "Recommended"
                        : "Below Threshold"}
                    </div>
                    <p className="mt-1 text-gray-600 text-xs">
                      Threshold: {threshold.threshold}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                {summary?.isComplete ? "Edit Scores" : "Score Event"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Score Event: {eventName}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {categories.map((category) => {
                  const currentScore = getCategoryScore(category.id);
                  return (
                    <div
                      key={category.id}
                      className="space-y-3 border-b pb-4 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-base">
                          {category.displayOrder}. {category.name}
                        </Label>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                          Weight: {category.weight}
                        </span>
                      </div>

                      <Select
                        value={currentScore}
                        onValueChange={(value) =>
                          handleScoreChange(category.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select score" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">9</span>
                              <span className="text-gray-600 text-sm">
                                {category.score9Description}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">3</span>
                              <span className="text-gray-600 text-sm">
                                {category.score3Description}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">1</span>
                              <span className="text-gray-600 text-sm">
                                {category.score1Description}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">0</span>
                              <span className="text-gray-600 text-sm">
                                {category.score0Description}
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {currentScore && (
                        <div className="rounded bg-gray-50 p-2 text-gray-700 text-sm">
                          {getScoreDescription(category, currentScore)}
                        </div>
                      )}

                      <div>
                        <Label
                          htmlFor={`notes-${category.id}`}
                          className="text-sm"
                        >
                          Notes (optional)
                        </Label>
                        <Textarea
                          id={`notes-${category.id}`}
                          value={getCategoryNotes(category.id)}
                          onChange={(e) =>
                            handleNotesChange(category.id, e.target.value)
                          }
                          placeholder="Additional context..."
                          rows={2}
                        />
                      </div>

                      {currentScore && (
                        <p className="text-gray-600 text-sm">
                          Weighted score:{" "}
                          {parseInt(currentScore) * category.weight}
                        </p>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={upsertBatch.isPending}
                >
                  {upsertBatch.isPending ? "Saving..." : "Save Scores"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {summary?.scores && summary.scores.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm">Score Breakdown</h4>
              <div className="space-y-1 text-sm">
                {summary.scores.map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-gray-700">
                      {score.category.name}
                    </span>
                    <span className="text-gray-600">
                      {score.score} × {score.category.weight} ={" "}
                      {score.score * score.category.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
