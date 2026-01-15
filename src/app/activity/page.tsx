import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ActivityFeed } from "~/components/activity/activity-feed";
import { Nav } from "~/components/nav";
import { NotificationBell } from "~/components/notifications/notification-bell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
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
