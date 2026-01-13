"use client";

import { useState } from "react";
import { addMonths, subMonths, addYears, subYears } from "date-fns";
import { api } from "~/trpc/react";
import { CalendarViewToggle } from "./calendar-view-toggle";
import { CalendarNavigation } from "./calendar-navigation";
import { MonthView } from "./month-view";
import { YearView } from "./year-view";
import { TimelineView } from "./timeline-view";
import { DayEventsPopover } from "./day-events-popover";

type CalendarView = "month" | "year" | "timeline";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
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
  const [view, setView] = useState<CalendarView>("timeline");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Query for fresh data with optimistic updates
  const { data: events = initialEvents } = api.event.getAll.useQuery();
  const { data: proposals = initialProposals } = api.proposal.getAll.useQuery();

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
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

  return (
    <div>
      {/* View toggle */}
      <div className="mb-6">
        <CalendarViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {/* Navigation (only for month and year views) */}
      {(view === "month" || view === "year") && (
        <div className="mb-6">
          <CalendarNavigation
            currentDate={currentDate}
            mode={view === "month" ? "month" : "year"}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}

      {/* Render appropriate view */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          events={events}
          proposals={proposals}
          onDayClick={handleDayClick}
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
