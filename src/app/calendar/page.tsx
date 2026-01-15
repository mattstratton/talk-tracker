import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { CalendarClientWrapper } from "./_components/calendar-client-wrapper";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "View your conference events in calendar format. Toggle between month, year, and timeline views to see upcoming events and CFP deadlines.",
};

export default async function CalendarPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [events, proposals] = await Promise.all([
    api.event.getAllWithScores(),
    api.proposal.getAll(),
  ]);

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Event Calendar
            </h2>
            <p className="text-muted-foreground text-sm">
              View events in month, year, or timeline format
            </p>
          </div>

          <CalendarClientWrapper
            initialEvents={events}
            initialProposals={proposals}
          />
        </div>
      </main>
    </HydrateClient>
  );
}
