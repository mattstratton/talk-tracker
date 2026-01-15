import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import { ImportTabs } from "./_components/import-tabs";

export const metadata: Metadata = {
  title: "Import Data",
  description:
    "Import events and talks from CSV files. Bulk load your conference data quickly and easily.",
};

export default async function ImportPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Import Data
            </h2>
            <p className="text-muted-foreground text-sm">
              Upload CSV files to bulk import events and talks
            </p>
          </div>

          <ImportTabs />
        </div>
      </main>
    </HydrateClient>
  );
}
