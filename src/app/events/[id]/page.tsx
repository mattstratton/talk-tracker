import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EditEventButton } from "./_components/edit-event-button";
import { EventActivityFeed } from "./_components/event-activity-feed";
import { EventParticipation } from "./_components/event-participation";
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
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/events">
              <Button size="sm" variant="ghost">
                ← Back to Events
              </Button>
            </Link>
            <EditEventButton event={event} />
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-semibold text-2xl text-gray-900 sm:text-3xl">
              {event.name}
            </h2>
            {event.description && (
              <p className="text-gray-600">{event.description}</p>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.startDate && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">Event Date</div>
                  <div className="font-medium text-gray-900">
                    {event.endDate && event.endDate !== event.startDate
                      ? `${event.startDate} - ${event.endDate}`
                      : event.startDate}
                  </div>
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
            {event.cfpUrl && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">CFP URL</div>
                  <div className="font-medium text-gray-900">
                    <a
                      className="text-blue-600 hover:underline"
                      href={event.cfpUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Submit Proposal →
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
            {event.conferenceWebsite && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">
                    Conference Website
                  </div>
                  <div className="font-medium text-gray-900">
                    <a
                      className="text-blue-600 hover:underline"
                      href={event.conferenceWebsite}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Visit Site →
                    </a>
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

          {event.notes && (
            <Card className="mb-8 border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-gray-900">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 text-sm">
                  {event.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <EventScoring eventId={eventId} eventName={event.name} />
          </div>

          <div className="mb-8">
            <EventParticipation eventId={eventId} eventName={event.name} />
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 sm:text-lg">
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
                    <Link href={`/proposals/${proposal.id}`} key={proposal.id}>
                      <div className="flex flex-col gap-2 border-b py-3 transition-colors last:border-0 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {proposal.talk.title}
                          </h3>
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {proposal.user.name} • {proposal.talkType}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-block whitespace-nowrap rounded px-2 py-1 text-xs ${getStatusColor(proposal.status)}`}
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

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 sm:text-lg">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventActivityFeed
                currentUserId={session.user.id}
                eventId={eventId}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
