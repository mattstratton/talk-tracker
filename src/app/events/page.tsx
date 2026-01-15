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
