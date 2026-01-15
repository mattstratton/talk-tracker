import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "~/components/nav";
import { NotificationBell } from "~/components/notifications/notification-bell";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

export async function AppHeader() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto max-w-full px-4">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-6">
            <Link href="/" className="flex shrink-0 items-center">
              <h1 className="font-bold text-foreground text-lg tracking-tight sm:text-xl">
                Prowl
              </h1>
            </Link>
            <div className="min-w-0 flex-1">
              <Nav />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
            <span className="hidden text-muted-foreground text-xs sm:text-sm md:inline">
              {session.user.name}
            </span>
            <NotificationBell />
            <form className="shrink-0">
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
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

