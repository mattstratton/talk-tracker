import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { ProposalsList } from "./_components/proposals-list";

export const metadata: Metadata = {
  title: "Proposals",
  description:
    "Track your conference talk proposals. Link talks to events and monitor submission status from draft through acceptance.",
};

export default async function ProposalsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [proposals, events, talks] = await Promise.all([
    api.proposal.getAll(),
    api.event.getAll(),
    api.talk.getAll(),
  ]);

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Proposals
            </h2>
            <p className="text-muted-foreground text-sm">
              Track all talk submissions across your team
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                All Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalsList
                currentUserId={session.user.id}
                events={events}
                initialProposals={proposals}
                talks={talks}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
