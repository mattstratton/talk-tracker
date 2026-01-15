import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentActivityWidget } from "~/app/_components/recent-activity-widget";
import { SignInForm } from "~/components/auth/sign-in-form";
import { AppHeader } from "~/components/app-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your conference speaking dashboard with upcoming CFP deadlines, recent proposals, and acceptance statistics.",
};

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <SignInForm />
      </main>
    );
  }

  const [proposals, events] = await Promise.all([
    api.proposal.getAll(),
    api.event.getAllWithScores(),
  ]);

  // Calculate CFP deadline urgency
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventsWithDeadlines = events
    .filter((e) => e.cfpDeadline)
    .map((event) => {
      const deadline = new Date(event.cfpDeadline!);
      deadline.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return { ...event, daysUntil };
    })
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const getUrgencyLabel = (days: number) => {
    if (days === 0) return "Due today!";
    if (days === 1) return "Due tomorrow";
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${days} days left`;
    return `${days} days left`;
  };

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Dashboard
            </h2>
            <p className="text-muted-foreground text-sm">
              Conference talk proposal tracking
            </p>
          </div>

          <div className="mb-6 grid gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-1 text-muted-foreground text-sm">
                  Total Proposals
                </div>
                <div className="font-semibold text-2xl text-foreground sm:text-3xl">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-1 text-muted-foreground text-sm">Accepted</div>
                <div className="font-semibold text-2xl sm:text-3xl" style={{ color: "#14D7C6" }}>
                  {proposals.filter((p) => p.status === "accepted").length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-1 text-muted-foreground text-sm">Pending</div>
                <div className="font-semibold text-2xl sm:text-3xl" style={{ color: "#755BFF" }}>
                  {proposals.filter((p) => p.status === "submitted").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {eventsWithDeadlines.length > 0 && (
            <Card className="mb-6 border-border sm:mb-8">
              <CardHeader>
                <CardTitle className="text-base text-foreground sm:text-lg">
                  Upcoming CFP Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventsWithDeadlines.slice(0, 5).map((event) => (
                    <Link href={`/events/${event.id}`} key={event.id}>
                      <div
                        className="flex flex-col gap-2 border-l-2 py-3 pl-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:pl-4"
                        style={{
                          borderLeftColor:
                            event.daysUntil <= 7
                              ? "#FF7044" // Tiger Blood for urgent
                              : event.daysUntil <= 30
                                ? "#F5FF80" // Electric Yellow for warning
                                : "#14D7C6", // Teal for good
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-foreground text-sm">
                              {event.name}
                            </h3>
                            {event.scoreInfo &&
                              event.scoreInfo.completionCount > 0 && (
                                <span
                                  className={`rounded-full px-2 py-0.5 font-semibold text-xs ${
                                    event.scoreInfo.meetsThreshold
                                      ? "bg-[#14D7C6] text-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {event.scoreInfo.meetsThreshold ? "✓" : ""}
                                  {event.scoreInfo.totalScore}/
                                  {event.scoreInfo.maxScore}
                                </span>
                              )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
                            {event.location && (
                              <span className="truncate">{event.location}</span>
                            )}
                            {event.startDate && (
                              <span>
                                •{" "}
                                {event.endDate &&
                                event.endDate !== event.startDate
                                  ? `${event.startDate} - ${event.endDate}`
                                  : event.startDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-medium text-foreground text-sm">
                            {getUrgencyLabel(event.daysUntil)}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {event.cfpDeadline}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {eventsWithDeadlines.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link href="/events">
                      <Button size="sm" variant="outline">
                        View All Events
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <RecentActivityWidget />

          <Card className="mb-6 border-border sm:mb-8">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                Recent Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-8 text-center sm:py-12">
                  <p className="mb-4 text-muted-foreground text-sm sm:text-base">
                    No proposals yet. Start by creating some talks and events.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                    <Link href="/talks">
                      <Button className="w-full sm:w-auto" type="button">
                        Create a Talk
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button
                        className="w-full sm:w-auto"
                        type="button"
                        variant="outline"
                      >
                        Add an Event
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.slice(0, 10).map((proposal) => (
                    <Link href={`/proposals/${proposal.id}`} key={proposal.id}>
                      <div className="flex flex-col gap-2 border-b border-border py-3 transition-colors last:border-0 hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground text-sm">
                            {proposal.talk.title}
                          </h3>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {proposal.event.name} • {proposal.user.name} •{" "}
                            {proposal.talkType}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-block whitespace-nowrap rounded px-2 py-1 text-xs ${
                              proposal.status === "accepted"
                                ? "bg-[#14D7C6] text-foreground"
                                : proposal.status === "rejected"
                                  ? "bg-[#FF7044] text-white"
                                  : proposal.status === "submitted"
                                    ? "bg-[#755BFF] text-white"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
