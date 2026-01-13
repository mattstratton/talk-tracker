"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";

type NavigationMode = "month" | "year";

interface CalendarNavigationProps {
  currentDate: Date;
  mode: NavigationMode;
  onPrevious: () => void;
  onNext: () => void;
}

export function CalendarNavigation({
  currentDate,
  mode,
  onPrevious,
  onNext,
}: CalendarNavigationProps) {
  const displayText =
    mode === "month"
      ? format(currentDate, "MMMM yyyy")
      : format(currentDate, "yyyy");

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={onPrevious}
        size="icon"
        type="button"
        variant="outline"
        aria-label={`Previous ${mode}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h2 className="text-xl font-semibold">{displayText}</h2>

      <Button
        onClick={onNext}
        size="icon"
        type="button"
        variant="outline"
        aria-label={`Next ${mode}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
