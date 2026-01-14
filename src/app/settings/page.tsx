import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { NotificationBell } from "~/components/notifications/notification-bell";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { NotificationSettings } from "./_components/notification-settings";
import { ScoringCategoriesSettings } from "./_components/scoring-categories-settings";
import { TalkTagsSettings } from "./_components/talk-tags-settings";
import { ThresholdSettings } from "./_components/threshold-settings";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure your Six Sigma scoring matrix categories, weights, and threshold. Customize how you evaluate conference speaking opportunities.",
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  // Prefetch data
  const [categories, threshold, tags] = await Promise.all([
    api.scoringCategory.getAll(),
    api.appSettings.getThreshold(),
    api.talkTag.getAll(),
  ]);

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
              Settings
            </h2>
            <p className="text-gray-600 text-sm">
              Configure scoring matrix and application settings
            </p>
          </div>

          <div className="space-y-8">
            <NotificationSettings />
            <ThresholdSettings initialThreshold={threshold} />
            <ScoringCategoriesSettings initialCategories={categories} />
            <TalkTagsSettings initialTags={tags} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
