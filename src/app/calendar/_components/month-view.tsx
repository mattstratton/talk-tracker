"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { MonthGridCell } from "./month-grid-cell";

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

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  proposals: Proposal[];
  onDayClick: (date: Date, events: Event[]) => void;
}

export function MonthView({
  currentDate,
  events,
  proposals,
  onDayClick,
}: MonthViewProps) {
  // Calculate the calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group events by date, including spanning events
  const eventsByDate = new Map<string, Event[]>();
  const cfpDeadlinesByDate = new Map<string, Event[]>();

  events.forEach((event) => {
    // Add events to their date ranges
    if (event.startDate) {
      const start = parseISO(event.startDate);
      const end = event.endDate ? parseISO(event.endDate) : start;

      // Generate all dates this event spans
      const eventDates = eachDayOfInterval({ start, end });

      eventDates.forEach((date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, []);
        }
        eventsByDate.get(dateKey)!.push(event);
      });
    }

    // Add CFP deadlines separately
    if (event.cfpDeadline) {
      const deadline = parseISO(event.cfpDeadline);
      const dateKey = format(deadline, "yyyy-MM-dd");
      if (!cfpDeadlinesByDate.has(dateKey)) {
        cfpDeadlinesByDate.set(dateKey, []);
      }
      cfpDeadlinesByDate.get(dateKey)!.push(event);
    }
  });

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {dayHeaders.map((day) => (
          <div
            className="border-r p-2 text-center font-semibold text-gray-700 text-sm last:border-r-0"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(dateKey) || [];
          const dayCfpDeadlines = cfpDeadlinesByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <MonthGridCell
              cfpDeadlines={dayCfpDeadlines}
              date={day}
              events={dayEvents}
              isCurrentMonth={isCurrentMonth}
              isLastInRow={(index + 1) % 7 === 0}
              key={dateKey}
              onDayClick={onDayClick}
              proposals={proposals}
            />
          );
        })}
      </div>
    </div>
  );
}
