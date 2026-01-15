"use client";

import { format, getQuarter, getYear, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
  }>;
};

interface EventsTimelineProps {
  events: Event[];
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  // Filter events with start dates and sort by date
  const eventsWithDates = events
    .filter((e) => e.startDate)
    .sort((a, b) => {
      const dateA = new Date(a.startDate!);
      const dateB = new Date(b.startDate!);
      return dateA.getTime() - dateB.getTime();
    });

  // Group events by quarter
  const eventsByQuarter = eventsWithDates.reduce(
    (acc, event) => {
      const date = parseISO(event.startDate!);
      const year = getYear(date);
      const quarter = getQuarter(date);
      const key = `${year}-Q${quarter}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key]!.push(event);
      return acc;
    },
    {} as Record<string, Event[]>,
  );

  const quarters = Object.keys(eventsByQuarter).sort();

  const participationTypeLabels: Record<string, string> = {
    speak: "Speaking",
    sponsor: "Sponsoring",
    attend: "Attending",
    exhibit: "Exhibiting",
    volunteer: "Volunteering",
  };

  const statusColors: Record<string, string> = {
    interested: "bg-muted text-muted-foreground",
    confirmed: "bg-[#14D7C6] text-foreground",
    not_going: "bg-[#FF7044] text-white",
  };

  if (eventsWithDates.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Events Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground text-sm">
            No events with dates yet. Add event dates to see the timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Events Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {quarters.map((quarter) => {
            const quarterEvents = eventsByQuarter[quarter]!;
            return (
              <div key={quarter}>
                <h3 className="mb-4 font-semibold text-foreground text-lg">
                  {quarter}
                </h3>
                <div className="space-y-3">
                  {quarterEvents.map((event) => (
                    <Link
                      className="block"
                      href={`/events/${event.id}`}
                      key={event.id}
                    >
                      <div className="rounded-lg border border-border p-4 transition-all hover:border-accent hover:shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {event.name}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-3 text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(parseISO(event.startDate!), "MMM d")}
                                  {event.endDate &&
                                    event.endDate !== event.startDate &&
                                    ` - ${format(parseISO(event.endDate), "MMM d, yyyy")}`}
                                  {!event.endDate &&
                                    `, ${format(parseISO(event.startDate!), "yyyy")}`}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Participation badges */}
                          {event.participations &&
                            event.participations.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {event.participations.map((p) => (
                                  <span
                                    className={`rounded-full px-2 py-1 font-semibold text-xs ${
                                      statusColors[p.status] ||
                                      "bg-muted text-muted-foreground"
                                    }`}
                                    key={p.id}
                                  >
                                    {participationTypeLabels[
                                      p.participationType
                                    ] || p.participationType}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
