import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EditProposalButton } from "./_components/edit-proposal-button";
import { ProposalActivityFeed } from "./_components/proposal-activity-feed";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const proposalId = parseInt(id);

  if (isNaN(proposalId)) {
    notFound();
  }

  const proposal = await api.proposal.getById({ id: proposalId });

  if (!proposal) {
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
      case "draft":
        return "bg-gray-100 text-gray-700";
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
            <Link href="/proposals">
              <Button size="sm" variant="ghost">
                ← Back to Proposals
              </Button>
            </Link>
            <EditProposalButton proposal={proposal} />
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-2xl text-gray-900 sm:text-3xl">
                Proposal Details
              </h2>
              <span
                className={`inline-block rounded px-3 py-1 text-sm ${getStatusColor(proposal.status)}`}
              >
                {proposal.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Submitted by {proposal.user.name}
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Talk Type</div>
                <div className="font-medium text-gray-900 capitalize">
                  {proposal.talkType}
                </div>
              </CardContent>
            </Card>
            {proposal.submissionDate && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-gray-600 text-xs">Submission Date</div>
                  <div className="font-medium text-gray-900">
                    {proposal.submissionDate}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Event</div>
                <Link href={`/events/${proposal.event.id}`}>
                  <div className="font-medium text-blue-600 hover:text-blue-700">
                    {proposal.event.name}
                  </div>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-gray-600 text-xs">Talk</div>
                <Link href={`/talks/${proposal.talk.id}`}>
                  <div className="truncate font-medium text-blue-600 hover:text-blue-700">
                    {proposal.talk.title}
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 sm:text-lg">
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-gray-600 text-xs">Event Name</div>
                  <Link href={`/events/${proposal.event.id}`}>
                    <div className="font-medium text-blue-600 hover:text-blue-700">
                      {proposal.event.name}
                    </div>
                  </Link>
                </div>
                {proposal.event.startDate && (
                  <div>
                    <div className="text-gray-600 text-xs">Event Date</div>
                    <div className="text-gray-900 text-sm">
                      {proposal.event.endDate &&
                      proposal.event.endDate !== proposal.event.startDate
                        ? `${proposal.event.startDate} - ${proposal.event.endDate}`
                        : proposal.event.startDate}
                    </div>
                  </div>
                )}
                {proposal.event.location && (
                  <div>
                    <div className="text-gray-600 text-xs">Location</div>
                    <div className="text-gray-900 text-sm">
                      {proposal.event.location}
                    </div>
                  </div>
                )}
                {proposal.event.cfpDeadline && (
                  <div>
                    <div className="text-gray-600 text-xs">CFP Deadline</div>
                    <div className="text-gray-900 text-sm">
                      {proposal.event.cfpDeadline}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 sm:text-lg">
                  Talk Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-gray-600 text-xs">Title</div>
                  <Link href={`/talks/${proposal.talk.id}`}>
                    <div className="font-medium text-blue-600 hover:text-blue-700">
                      {proposal.talk.title}
                    </div>
                  </Link>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">Abstract</div>
                  <p className="whitespace-pre-wrap text-gray-700 text-sm">
                    {proposal.talk.abstract}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {proposal.notes && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 sm:text-lg">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 text-sm">
                  {proposal.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 sm:text-lg">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalActivityFeed
                currentUserId={session.user.id}
                proposalId={proposalId}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
