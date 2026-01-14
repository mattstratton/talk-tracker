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
import { TalksList } from "./_components/talks-list";

export const metadata: Metadata = {
  title: "Talk Library",
  description:
    "Create and manage your reusable talk content library. Store titles, abstracts, and descriptions that can be used for multiple conference submissions.",
};

export default async function TalksPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const talks = await api.talk.getAll();

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
            <h2 className="mb-1 font-semibold text-gray-900 text-xl sm:text-2xl">
              Talk Library
            </h2>
            <p className="text-gray-600 text-sm">
              Manage your reusable talk content and abstracts
            </p>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 sm:text-lg">
                All Talks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TalksList initialTalks={talks} />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
