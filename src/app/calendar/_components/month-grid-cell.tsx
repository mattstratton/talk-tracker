"use client";

import { format, isToday } from "date-fns";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
  }>;
};

type Proposal = {
  id: number;
  eventId: number;
  status: string;
};

interface MonthGridCellProps {
  date: Date;
  events: Event[];
  cfpDeadlines: Event[];
  proposals: Proposal[];
  isCurrentMonth: boolean;
  onDayClick: (date: Date, events: Event[]) => void;
  isLastInRow: boolean;
}

export function MonthGridCell({
  date,
  events,
  cfpDeadlines,
  proposals,
  isCurrentMonth,
  onDayClick,
  isLastInRow,
}: MonthGridCellProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventColor = (event: Event) => {
    // Priority 1: Color by participation type if exists
    if (event.participations && event.participations.length > 0) {
      // Use the first participation type for color coding
      const participation = event.participations[0]!;

      // Color by participation type
      switch (participation.participationType) {
        case "speak":
          return "bg-purple-500"; // Purple for speaking
        case "sponsor":
          return "bg-orange-500"; // Orange for sponsoring
        case "exhibit":
          return "bg-cyan-500"; // Cyan for exhibiting
        case "attend":
          return "bg-blue-500"; // Blue for attending
        case "volunteer":
          return "bg-teal-500"; // Teal for volunteering
        default:
          return "bg-gray-500";
      }
    }

    // Priority 2: Check if event has accepted proposals
    const hasAcceptedProposals = proposals.some(
      (p) => p.eventId === event.id && p.status === "Accepted",
    );

    if (hasAcceptedProposals) {
      return "bg-green-500"; // Green for accepted proposals
    }

    // Priority 3: Color by CFP urgency
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

  const getCfpUrgencyColor = (event: Event) => {
    if (!event.cfpDeadline) return "bg-gray-400";

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

  // Show up to 2 events and up to 2 CFP deadlines
  const visibleEvents = events.slice(0, 2);
  const visibleCfpDeadlines = cfpDeadlines.slice(0, 2);
  const totalItems = events.length + cfpDeadlines.length;
  const visibleItems = visibleEvents.length + visibleCfpDeadlines.length;
  const remainingCount = totalItems - visibleItems;

  return (
    <div
      className={`min-h-24 border-r border-b border-border p-1.5 transition-colors hover:bg-muted sm:p-2 ${
        isLastInRow ? "border-r-0" : ""
      } ${isCurrentMonth ? "bg-card" : "bg-muted/30"} ${
        totalItems > 0 ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (totalItems > 0) {
          // Combine events and CFP deadline events for the popover
          const allEvents = [...events, ...cfpDeadlines];
          // Remove duplicates (events that are both on this date AND have CFP deadline on this date)
          const uniqueEvents = Array.from(
            new Map(allEvents.map((e) => [e.id, e])).values(),
          );
          onDayClick(date, uniqueEvents);
        }
      }}
    >
      <div
        className={`mb-1 text-right text-xs sm:text-sm ${
          isToday(date)
            ? "ml-auto flex h-5 w-5 items-center justify-center rounded-full font-semibold text-white sm:h-6 sm:w-6"
            : isCurrentMonth
              ? "text-foreground"
              : "text-muted-foreground"
        }`}
        style={
          isToday(date)
            ? { backgroundColor: "#755BFF" }
            : undefined
        }
      >
        {format(date, "d")}
      </div>

      {/* Event and CFP deadline indicators */}
      <div className="space-y-0.5">
        {/* Events (circle indicators) */}
        {visibleEvents.map((event) => (
          <div className="flex min-w-0 items-center gap-1" key={`event-${event.id}`}>
            <div
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full sm:h-2 sm:w-2 ${getEventColor(event)}`}
            />
            <span className="min-w-0 truncate text-foreground text-[10px] sm:text-xs">{event.name}</span>
          </div>
        ))}

        {/* CFP Deadlines (square indicators) */}
        {visibleCfpDeadlines.map((event) => (
          <div className="flex min-w-0 items-center gap-1" key={`cfp-${event.id}`}>
            <div
              className={`h-1.5 w-1.5 flex-shrink-0 sm:h-2 sm:w-2 ${getCfpUrgencyColor(event)}`}
            />
            <span className="min-w-0 truncate text-foreground text-[10px] sm:text-xs">
              CFP: {event.name}
            </span>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="text-muted-foreground text-[10px] sm:text-xs">+{remainingCount} more</div>
        )}
      </div>
    </div>
  );
}
