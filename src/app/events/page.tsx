import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { EventsList } from "./_components/events-list";

export default async function EventsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const events = await api.event.getAllWithScores();

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
              Events & Conferences
            </h2>
            <p className="text-gray-600 text-sm">
              Manage the conferences and events you're targeting
            </p>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-900">All Events</CardTitle>
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
