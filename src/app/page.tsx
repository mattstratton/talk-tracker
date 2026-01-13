import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "~/components/auth/sign-in-form";
import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

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
    api.event.getAll(),
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
              Dashboard
            </h2>
            <p className="text-gray-600 text-sm">
              Conference talk proposal tracking
            </p>
          </div>

          <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-1 text-gray-500 text-sm">Total Proposals</div>
                <div className="font-semibold text-3xl text-gray-900">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-1 text-gray-500 text-sm">Accepted</div>
                <div className="font-semibold text-3xl text-green-600">
                  {proposals.filter((p) => p.status === "accepted").length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-1 text-gray-500 text-sm">Pending</div>
                <div className="font-semibold text-3xl text-blue-600">
                  {proposals.filter((p) => p.status === "submitted").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {eventsWithDeadlines.length > 0 && (
            <Card className="mb-6 sm:mb-8 border-gray-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900">
                  Upcoming CFP Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventsWithDeadlines.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                    >
                      <div
                        className="flex flex-col gap-2 border-l-2 py-3 pl-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:pl-4"
                        style={{
                          borderLeftColor:
                            event.daysUntil <= 7
                              ? "#dc2626"
                              : event.daysUntil <= 30
                                ? "#f59e0b"
                                : "#10b981",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">{event.name}</h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600 text-xs">
                            {event.location && (
                              <span className="truncate">
                                {event.location}
                              </span>
                            )}
                            {event.date && (
                              <span>
                                • {event.date}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-medium text-gray-900 text-sm">
                            {getUrgencyLabel(event.daysUntil)}
                          </div>
                          <div className="text-gray-500 text-xs">
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

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900">
                Recent Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-8 sm:py-12 text-center">
                  <p className="mb-4 text-gray-600 text-sm sm:text-base">
                    No proposals yet. Start by creating some talks and events.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                    <Link href="/talks">
                      <Button className="w-full sm:w-auto" type="button">Create a Talk</Button>
                    </Link>
                    <Link href="/events">
                      <Button className="w-full sm:w-auto" type="button" variant="outline">
                        Add an Event
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.slice(0, 10).map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/proposals/${proposal.id}`}
                    >
                      <div
                        className="flex flex-col gap-2 border-b py-3 last:border-0 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {proposal.talk.title}
                          </h3>
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {proposal.event.name} • {proposal.user.name} • {proposal.talkType}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs whitespace-nowrap ${
                              proposal.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : proposal.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : proposal.status === "submitted"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
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
