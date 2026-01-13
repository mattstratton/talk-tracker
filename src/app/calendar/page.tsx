import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "View your conference events in timeline format. See upcoming events, CFP deadlines, and proposal counts at a glance.",
};

export default async function CalendarPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [events, proposals] = await Promise.all([
    api.event.getAll(),
    api.proposal.getAll(),
  ]);

  // Create timeline data structure
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group events by quarter
  const eventsByQuarter = new Map<string, typeof events>();

  const sortedEvents = events
    .filter((e) => e.date)
    .sort((a, b) => {
      const dateA = new Date(a.date!);
      const dateB = new Date(b.date!);
      return dateA.getTime() - dateB.getTime();
    });

  sortedEvents.forEach((event) => {
    const eventDate = new Date(event.date!);
    const year = eventDate.getFullYear();
    const quarter = Math.floor(eventDate.getMonth() / 3) + 1;
    const key = `${year} Q${quarter}`;

    if (!eventsByQuarter.has(key)) {
      eventsByQuarter.set(key, []);
    }
    eventsByQuarter.get(key)!.push(event);
  });

  const getEventStatus = (event: (typeof events)[0]) => {
    const eventDate = new Date(event.date!);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return { label: "Past", color: "bg-gray-100 text-gray-800" };
    }

    const daysUntil = Math.ceil(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil <= 30) {
      return { label: "This Month", color: "bg-green-100 text-green-800" };
    }
    if (daysUntil <= 90) {
      return { label: "Next 3 Months", color: "bg-blue-100 text-blue-800" };
    }
    return { label: "Future", color: "bg-purple-100 text-purple-800" };
  };

  const getCFPStatus = (cfpDeadline: string | null) => {
    if (!cfpDeadline) return null;

    const deadline = new Date(cfpDeadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      return { label: "CFP Closed", color: "bg-gray-100 text-gray-600" };
    }
    if (daysUntil === 0) {
      return { label: "CFP Due Today!", color: "bg-red-500 text-white" };
    }
    if (daysUntil <= 7) {
      return {
        label: `CFP: ${daysUntil}d left`,
        color: "bg-red-100 text-red-800",
      };
    }
    if (daysUntil <= 30) {
      return {
        label: `CFP: ${daysUntil}d left`,
        color: "bg-yellow-100 text-yellow-800",
      };
    }
    return {
      label: `CFP: ${daysUntil}d left`,
      color: "bg-green-100 text-green-800",
    };
  };

  const getProposalCount = (eventId: number) => {
    return proposals.filter((p) => p.eventId === eventId).length;
  };

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Nav />
                <h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
                  Talk Tracker
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden text-gray-600 text-sm sm:inline">
                  {session.user.name}
                </span>
                <form>
                  <Button
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/");
                    }}
                    size="sm"
                    type="submit"
                    variant="outline"
                  >
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-xl sm:text-2xl text-gray-900">
              Event Calendar
            </h2>
            <p className="text-gray-600 text-sm">
              Timeline view of upcoming conferences and CFP deadlines
            </p>
          </div>

          {sortedEvents.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-gray-600">
                  No events with dates yet. Add event dates to see them on the
                  timeline!
                </p>
                <Link href="/events">
                  <Button type="button">Manage Events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Array.from(eventsByQuarter.entries()).map(
                ([quarter, quarterEvents]) => (
                  <div key={quarter}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <h3 className="font-semibold text-gray-900 text-lg">{quarter}</h3>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="space-y-3">
                      {quarterEvents.map((event) => {
                        const status = getEventStatus(event);
                        const cfpStatus = getCFPStatus(event.cfpDeadline);
                        const proposalCount = getProposalCount(event.id);

                        return (
                          <Link key={event.id} href={`/events/${event.id}`}>
                            <Card className="border-gray-200 transition-shadow hover:shadow-md">
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start gap-3 sm:gap-4">
                                  <div className="flex-shrink-0 w-16 sm:w-20 text-center">
                                    <div className="font-semibold text-gray-900 text-xl sm:text-2xl">
                                      {new Date(event.date!).getDate()}
                                    </div>
                                    <div className="text-gray-600 text-xs sm:text-sm">
                                      {new Date(event.date!).toLocaleDateString(
                                        "en-US",
                                        { month: "short" },
                                      )}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {new Date(event.date!).getFullYear()}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        {event.name}
                                      </h4>
                                      <span
                                        className={`rounded px-2 py-0.5 text-xs ${status.color}`}
                                      >
                                        {status.label}
                                      </span>
                                      {cfpStatus && (
                                        <span
                                          className={`rounded px-2 py-0.5 text-xs ${cfpStatus.color}`}
                                        >
                                          {cfpStatus.label}
                                        </span>
                                      )}
                                    </div>
                                    <div className="space-y-1 text-gray-600 text-xs sm:text-sm">
                                      {event.location && (
                                        <p className="truncate">{event.location}</p>
                                      )}
                                      {event.cfpDeadline && (
                                        <p>
                                          CFP Deadline:{" "}
                                          {new Date(
                                            event.cfpDeadline,
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </p>
                                      )}
                                      {proposalCount > 0 && (
                                        <p>
                                          {proposalCount === 1
                                            ? "1 proposal"
                                            : `${proposalCount} proposals`}{" "}
                                          submitted
                                        </p>
                                      )}
                                      {event.description && (
                                        <p className="mt-2">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
