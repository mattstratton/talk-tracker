import { redirect } from "next/navigation";
import { ActivityFeed } from "~/components/activity/activity-feed";
import { AppHeader } from "~/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function ActivityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-semibold text-2xl text-foreground sm:text-3xl">
              Activity Feed
            </h2>
            <p className="text-muted-foreground text-sm">
              Recent comments and status changes across all proposals
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground sm:text-lg">
                All Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityFeed currentUserId={session.user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
