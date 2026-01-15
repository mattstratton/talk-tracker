import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
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
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Settings
            </h2>
            <p className="text-muted-foreground text-sm">
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
