"use client";

import { addMonths, addYears, subMonths, subYears } from "date-fns";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CalendarLegend } from "./calendar-legend";
import { CalendarNavigation } from "./calendar-navigation";
import { CalendarViewToggle } from "./calendar-view-toggle";
import { DayEventsPopover } from "./day-events-popover";
import { exportToICalendar } from "./export-ical";
import { MonthView } from "./month-view";
import { TimelineView } from "./timeline-view";
import { YearView } from "./year-view";

type CalendarView = "month" | "year" | "timeline";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
  conferenceWebsite?: string | null;
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

interface CalendarClientWrapperProps {
  initialEvents: Event[];
  initialProposals: Proposal[];
}

export function CalendarClientWrapper({
  initialEvents,
  initialProposals,
}: CalendarClientWrapperProps) {
  // Load saved view from localStorage, default to month
  const [view, setView] = useState<CalendarView>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("calendarView");
      return (saved as CalendarView) || "month";
    }
    return "month";
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Query for fresh data with optimistic updates
  const { data: events = initialEvents } =
    api.event.getAllWithScores.useQuery();
  const { data: proposals = initialProposals } = api.proposal.getAll.useQuery();

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarView", newView);
    }
  };

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "year") {
      setCurrentDate(subYears(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "year") {
      setCurrentDate(addYears(currentDate, 1));
    }
  };

  const handleDayClick = (date: Date, dayEvents: Event[]) => {
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
    setIsPopoverOpen(true);
  };

  const handleMonthClick = (date: Date) => {
    setCurrentDate(date);
    setView("month");
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleExport = () => {
    exportToICalendar(events);
  };

  return (
    <div>
      {/* View toggle and export button */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CalendarViewToggle onViewChange={handleViewChange} view={view} />
        <Button onClick={handleExport} size="sm" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to iCal
        </Button>
      </div>

      {/* Navigation (only for month and year views) */}
      {(view === "month" || view === "year") && (
        <div className="mb-6">
          <CalendarNavigation
            currentDate={currentDate}
            mode={view === "month" ? "month" : "year"}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      )}

      {/* Calendar and Legend Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Calendar View */}
        <div className="min-w-0">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              proposals={proposals}
            />
          )}

          {view === "year" && (
            <YearView
              currentDate={currentDate}
              events={events}
              onMonthClick={handleMonthClick}
            />
          )}

          {view === "timeline" && (
            <TimelineView events={events} proposals={proposals} />
          )}
        </div>

        {/* Legend Sidebar */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CalendarLegend />
        </div>
      </div>

      {/* Day events popover */}
      <DayEventsPopover
        date={selectedDate}
        events={selectedEvents}
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
      />
    </div>
  );
}
