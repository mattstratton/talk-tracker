"use client";

import { format, isToday } from "date-fns";

type Event = {
  id: number;
  name: string;
  date: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
};

type Proposal = {
  id: number;
  eventId: number;
  status: string;
};

interface MonthGridCellProps {
  date: Date;
  events: Event[];
  proposals: Proposal[];
  isCurrentMonth: boolean;
  onDayClick: (date: Date, events: Event[]) => void;
  isLastInRow: boolean;
}

export function MonthGridCell({
  date,
  events,
  proposals,
  isCurrentMonth,
  onDayClick,
  isLastInRow,
}: MonthGridCellProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventColor = (event: Event) => {
    // Check if event has accepted proposals
    const hasAcceptedProposals = proposals.some(
      (p) => p.eventId === event.id && p.status === "Accepted",
    );

    if (hasAcceptedProposals) {
      return "bg-green-500"; // Green for accepted proposals
    }

    if (!event.cfpDeadline) {
      return "bg-blue-500"; // Blue for regular events
    }

    const deadline = new Date(event.cfpDeadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      return "bg-gray-400"; // Gray for closed CFPs
    }
    if (daysUntil <= 7) {
      return "bg-red-500"; // Red for urgent CFPs
    }
    if (daysUntil <= 30) {
      return "bg-yellow-500"; // Yellow for upcoming CFPs
    }
    return "bg-green-500"; // Green for distant CFPs
  };

  const visibleEvents = events.slice(0, 3);
  const remainingCount = events.length - 3;

  return (
    <div
      className={`min-h-24 border-b border-r p-2 transition-colors hover:bg-gray-50 ${
        isLastInRow ? "border-r-0" : ""
      } ${isCurrentMonth ? "bg-white" : "bg-gray-50"} ${
        events.length > 0 ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (events.length > 0) {
          onDayClick(date, events);
        }
      }}
    >
      <div
        className={`mb-1 text-right text-sm ${
          isToday(date)
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white ml-auto"
            : isCurrentMonth
              ? "text-gray-900"
              : "text-gray-400"
        }`}
      >
        {format(date, "d")}
      </div>

      {/* Event indicators */}
      <div className="space-y-0.5">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-1"
          >
            <div className={`h-2 w-2 flex-shrink-0 rounded-full ${getEventColor(event)}`} />
            <span className="truncate text-xs text-gray-700">
              {event.name}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-gray-600 text-xs">+{remainingCount} more</div>
        )}
      </div>
    </div>
  );
}
