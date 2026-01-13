"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from "date-fns";
import { MonthGridCell } from "./month-grid-cell";

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

  // Group events by date
  const eventsByDate = new Map<string, Event[]>();
  events.forEach((event) => {
    if (event.date) {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    }
  });

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="border-r p-2 text-center font-semibold text-gray-700 text-sm last:border-r-0"
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
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <MonthGridCell
              key={dateKey}
              date={day}
              events={dayEvents}
              proposals={proposals}
              isCurrentMonth={isCurrentMonth}
              onDayClick={onDayClick}
              isLastInRow={(index + 1) % 7 === 0}
            />
          );
        })}
      </div>
    </div>
  );
}
