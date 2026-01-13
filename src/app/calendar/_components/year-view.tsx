"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  setMonth,
} from "date-fns";

type Event = {
  id: number;
  name: string;
  date: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
};

interface YearViewProps {
  currentDate: Date;
  events: Event[];
  onMonthClick: (date: Date) => void;
}

export function YearView({
  currentDate,
  events,
  onMonthClick,
}: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);

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

  const getMonthEventCount = (monthIndex: number) => {
    const monthDate = setMonth(currentDate, monthIndex);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    let count = 0;
    events.forEach((event) => {
      if (event.date) {
        const eventDate = new Date(event.date);
        if (eventDate >= monthStart && eventDate <= monthEnd) {
          count++;
        }
      }
    });

    return count;
  };

  const renderMiniMonth = (monthIndex: number) => {
    const monthDate = setMonth(currentDate, monthIndex);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const eventCount = getMonthEventCount(monthIndex);

    return (
      <div
        key={monthIndex}
        className="cursor-pointer rounded-lg border bg-white p-3 transition-shadow hover:shadow-md"
        onClick={() => onMonthClick(monthDate)}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            {format(monthDate, "MMMM")}
          </h3>
          {eventCount > 0 && (
            <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800 text-xs">
              {eventCount}
            </span>
          )}
        </div>

        {/* Mini calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-gray-500 text-xs"
            >
              {day}
            </div>
          ))}

          {/* Days */}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const hasEvents = eventsByDate.has(dateKey);
            const isCurrentMonth = isSameMonth(day, monthDate);

            return (
              <div
                key={dateKey}
                className={`flex h-6 w-6 items-center justify-center text-xs ${
                  isCurrentMonth ? "text-gray-900" : "text-gray-300"
                }`}
              >
                <div className="relative">
                  {format(day, "d")}
                  {hasEvents && isCurrentMonth && (
                    <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((monthIndex) => renderMiniMonth(monthIndex))}
    </div>
  );
}
