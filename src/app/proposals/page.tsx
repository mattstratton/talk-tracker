import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { NotificationBell } from "~/components/notifications/notification-bell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
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
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Nav />
                <h1 className="font-semibold text-foreground text-lg sm:text-xl">
                  Talk Tracker
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden text-muted-foreground text-sm sm:inline">
                  {session.user.name}
                </span>
                <NotificationBell />
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
