"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        aria-label={`Previous ${mode}`}
        onClick={onPrevious}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h2 className="font-semibold text-xl">{displayText}</h2>

      <Button
        aria-label={`Next ${mode}`}
        onClick={onNext}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
