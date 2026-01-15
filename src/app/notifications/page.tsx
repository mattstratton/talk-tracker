import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import { NotificationFeed } from "./_components/notification-feed";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "View all your notifications including mentions, status changes, comments, and CFP deadline reminders.",
};

export default async function NotificationsPage() {
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
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Notifications
            </h2>
            <p className="text-muted-foreground text-sm">
              Stay updated on mentions, status changes, comments, and deadlines
            </p>
          </div>

          <NotificationFeed />
        </div>
      </main>
    </HydrateClient>
  );
}
