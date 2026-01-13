import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EventScoring } from "./_components/event-scoring";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    notFound();
  }

  const [event, proposals] = await Promise.all([
    api.event.getById({ id: eventId }),
    api.proposal.getByEvent({ eventId }),
  ]);

  if (!event) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
          <div className="mb-6">
            <Link href="/events">
              <Button size="sm" variant="ghost">
                ← Back to Events
              </Button>
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-semibold text-2xl sm:text-3xl text-gray-900">
              {event.name}
            </h2>
            {event.description && (
              <p className="text-gray-600">{event.description}</p>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {event.date && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">Event Date</div>
                  <div className="font-medium text-gray-900">{event.date}</div>
                </CardContent>
              </Card>
            )}
            {event.location && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">Location</div>
                  <div className="font-medium text-gray-900">
                    {event.location}
                  </div>
                </CardContent>
              </Card>
            )}
            {event.cfpDeadline && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">CFP Deadline</div>
                  <div className="font-medium text-gray-900">
                    {event.cfpDeadline}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Total Proposals</div>
                <div className="font-semibold text-2xl text-gray-900">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <EventScoring eventId={eventId} eventName={event.name} />
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900">
                Proposals for this Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-600">
                    No proposals submitted to this event yet.
                  </p>
                  <Link href="/proposals">
                    <Button>Create Proposal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/proposals/${proposal.id}`}
                    >
                      <div className="flex flex-col gap-2 border-b py-3 last:border-0 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {proposal.talk.title}
                          </h3>
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {proposal.user.name} • {proposal.talkType}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs whitespace-nowrap ${getStatusColor(proposal.status)}`}
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
