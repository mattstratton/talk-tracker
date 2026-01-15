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
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <h1 className="font-bold text-foreground text-xl tracking-tight">
                Talk Tracker
              </h1>
            </Link>
            <Nav />
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
  );
}

