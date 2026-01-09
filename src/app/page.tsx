import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "~/components/auth/sign-in-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <SignInForm />
      </main>
    );
  }

  const proposals = await api.proposal.getAll();

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
            <h2 className="mb-2 font-bold text-3xl">Dashboard</h2>
            <p className="text-muted-foreground">
              Track conference talk proposals across your DevRel team
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-sm">
                  Total Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{proposals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-sm">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {proposals.filter((p) => p.status === "accepted").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-medium text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {proposals.filter((p) => p.status === "submitted").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="mb-4 text-muted-foreground">
                    No proposals yet. Start by creating some talks and events!
                  </p>
                  <div className="flex justify-center gap-2">
                    <Link href="/talks">
                      <Button type="button">Create a Talk</Button>
                    </Link>
                    <Link href="/events">
                      <Button type="button" variant="outline">
                        Add an Event
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.slice(0, 10).map((proposal) => (
                    <div
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                      key={proposal.id}
                    >
                      <div>
                        <h3 className="font-semibold">{proposal.talk.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {proposal.event.name} • {proposal.user.name} •{" "}
                          {proposal.talkType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            proposal.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : proposal.status === "submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </HydrateClient>
  );
}
