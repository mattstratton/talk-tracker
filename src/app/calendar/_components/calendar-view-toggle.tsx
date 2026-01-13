"use client";

import { Button } from "~/components/ui/button";

type CalendarView = "month" | "year" | "timeline";

interface CalendarViewToggleProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarViewToggle({
  view,
  onViewChange,
}: CalendarViewToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onViewChange("month")}
        size="sm"
        type="button"
        variant={view === "month" ? "default" : "outline"}
      >
        Month
      </Button>
      <Button
        onClick={() => onViewChange("year")}
        size="sm"
        type="button"
        variant={view === "year" ? "default" : "outline"}
      >
        Year
      </Button>
      <Button
        onClick={() => onViewChange("timeline")}
        size="sm"
        type="button"
        variant={view === "timeline" ? "default" : "outline"}
      >
        Timeline
      </Button>
    </div>
  );
}
