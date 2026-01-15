import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Talk Library
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage your reusable talk content and abstracts
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
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
