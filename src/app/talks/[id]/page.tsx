import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { TagBadge } from "~/components/tag-badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EditTalkButton } from "./_components/edit-talk-button";
import { TalkActivityFeed } from "./_components/talk-activity-feed";

export default async function TalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const talkId = parseInt(id);

  if (isNaN(talkId)) {
    notFound();
  }

  const [talk, proposals] = await Promise.all([
    api.talk.getById({ id: talkId }),
    api.proposal.getByTalk({ talkId }),
  ]);

  if (!talk) {
    notFound();
  }

  const acceptedCount = proposals.filter(
    (p) => p.status === "accepted" || p.status === "confirmed",
  ).length;
  const acceptanceRate =
    proposals.length > 0 ? (acceptedCount / proposals.length) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "bg-[#14D7C6] text-foreground"; // Teal
      case "rejected":
        return "bg-[#FF7044] text-white"; // Tiger Blood
      case "submitted":
        return "bg-[#755BFF] text-white"; // Vivid Purple
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/talks">
              <Button size="sm" variant="ghost">
                ← Back to Talks
              </Button>
            </Link>
            <EditTalkButton talk={talk} />
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-semibold text-2xl text-foreground sm:text-3xl">
              {talk.title}
            </h2>
            <p className="text-muted-foreground text-sm">by {talk.createdBy.name}</p>
            {talk.talkTagAssignments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {talk.talkTagAssignments.map((assignment) => (
                  <TagBadge key={assignment.id} tag={assignment.tag} />
                ))}
              </div>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs">Total Submissions</div>
                <div className="font-semibold text-2xl text-foreground">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs">Accepted</div>
                <div className="font-semibold text-2xl text-green-600">
                  {acceptedCount}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs">Rejected</div>
                <div className="font-semibold text-2xl text-red-600">
                  {proposals.filter((p) => p.status === "rejected").length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="text-muted-foreground text-xs">Acceptance Rate</div>
                <div className="font-semibold text-2xl text-foreground">
                  {acceptanceRate.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground sm:text-lg">
                  Abstract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground text-sm">
                  {talk.abstract}
                </p>
              </CardContent>
            </Card>

            {talk.description && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground sm:text-lg">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground text-sm">
                    {talk.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                Submission History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    This talk hasn't been submitted to any events yet.
                  </p>
                  <Link href="/proposals">
                    <Button>Submit to Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((proposal) => (
                    <Link href={`/proposals/${proposal.id}`} key={proposal.id}>
                      <div className="flex flex-col gap-2 border-b py-3 transition-colors last:border-0 hover:bg-background sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground text-sm">
                            {proposal.event.name}
                          </h3>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {proposal.user.name} • {proposal.talkType}
                            {proposal.submissionDate &&
                              ` • Submitted ${proposal.submissionDate}`}
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

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TalkActivityFeed
                currentUserId={session.user.id}
                talkId={talkId}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
