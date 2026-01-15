import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EventsList } from "./_components/events-list";

export const metadata: Metadata = {
  title: "Events & Conferences",
  description:
    "Manage the conferences and events you're targeting. Score events using the Six Sigma matrix to identify which ones are worth submitting to.",
};

export default async function EventsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const events = await api.event.getAllWithScores();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Events & Conferences
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage the conferences and events you're targeting
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                All Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventsList initialEvents={events} />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
