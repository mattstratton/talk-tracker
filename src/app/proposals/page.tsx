import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { ProposalsList } from "./_components/proposals-list";

export default async function ProposalsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [proposals, events, talks] = await Promise.all([
    api.proposal.getAll(),
    api.event.getAll(),
    api.talk.getAll(),
  ]);

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <div className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <h1 className="font-bold text-xl">Talk Tracker</h1>
              <nav className="flex gap-4">
                <Link href="/">
                  <Button type="button" variant="ghost">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/events">
                  <Button type="button" variant="ghost">
                    Events
                  </Button>
                </Link>
                <Link href="/talks">
                  <Button type="button" variant="ghost">
                    Talks
                  </Button>
                </Link>
                <Link href="/proposals">
                  <Button type="button" variant="ghost">
                    Proposals
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                {session.user.name}
              </span>
              <form>
                <Button
                  formAction={async () => {
                    "use server";
                    await auth.api.signOut({
                      headers: await headers(),
                    });
                    redirect("/");
                  }}
                  type="submit"
                  variant="outline"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="mb-2 font-bold text-3xl">Proposals</h2>
            <p className="text-muted-foreground">
              Track all talk submissions across your team
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalsList
                events={events}
                initialProposals={proposals}
                talks={talks}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
