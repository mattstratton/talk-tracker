import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Nav } from "~/components/nav";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [talks, proposals] = await Promise.all([
    api.talk.getAll(),
    api.proposal.getAll(),
  ]);

  // Calculate statistics for each talk
  const talkStats = talks.map((talk) => {
    const talkProposals = proposals.filter((p) => p.talkId === talk.id);
    const totalSubmissions = talkProposals.length;
    const acceptedCount = talkProposals.filter(
      (p) => p.status === "accepted" || p.status === "confirmed",
    ).length;
    const acceptanceRate =
      totalSubmissions > 0 ? (acceptedCount / totalSubmissions) * 100 : 0;

    const events = talkProposals.map((p) => ({
      name: p.event.name,
      status: p.status,
    }));

    return {
      ...talk,
      totalSubmissions,
      acceptedCount,
      acceptanceRate,
      events,
    };
  });

  // Sort by acceptance rate (descending), then by total submissions
  const sortedTalkStats = talkStats.sort((a, b) => {
    if (b.acceptanceRate !== a.acceptanceRate) {
      return b.acceptanceRate - a.acceptanceRate;
    }
    return b.totalSubmissions - a.totalSubmissions;
  });

  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 75) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    if (rate > 0) return "text-orange-600";
    return "text-gray-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <h2 className="mb-1 font-semibold text-xl sm:text-2xl text-gray-900">
              Talk Analytics
            </h2>
            <p className="text-gray-600 text-sm">
              Track which talks are most successful and identify your strongest
              content
            </p>
          </div>

          {sortedTalkStats.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-gray-600">
                  No talks yet. Create some talks and submit them to events to
                  see analytics!
                </p>
                <Link href="/talks">
                  <Button type="button">Create a Talk</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedTalkStats.map((talk) => (
                <Card className="border-gray-200" key={talk.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-gray-900 text-lg">{talk.title}</CardTitle>
                        <p className="mt-1 text-gray-600 text-sm">
                          by {talk.createdBy.name}
                        </p>
                      </div>
                      <div className="text-right">
                        {talk.totalSubmissions > 0 ? (
                          <>
                            <div
                              className={`mb-1 font-semibold text-2xl ${getAcceptanceRateColor(talk.acceptanceRate)}`}
                            >
                              {talk.acceptanceRate.toFixed(0)}%
                            </div>
                            <p className="text-gray-600 text-xs">
                              acceptance rate
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-600 text-sm">
                            Not submitted yet
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-gray-600 text-xs">
                          Total Submissions
                        </p>
                        <p className="font-semibold text-gray-900 text-lg sm:text-xl">
                          {talk.totalSubmissions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">
                          Accepted
                        </p>
                        <p className="font-semibold text-green-600 text-lg sm:text-xl">
                          {talk.acceptedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">
                          Rejected
                        </p>
                        <p className="font-semibold text-red-600 text-lg sm:text-xl">
                          {
                            talk.events.filter((e) => e.status === "rejected")
                              .length
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Pending</p>
                        <p className="font-semibold text-blue-600 text-lg sm:text-xl">
                          {
                            talk.events.filter(
                              (e) =>
                                e.status === "submitted" ||
                                e.status === "draft",
                            ).length
                          }
                        </p>
                      </div>
                    </div>

                    {talk.events.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium text-gray-900 text-sm">
                          Submitted to:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {talk.events.map((event, idx) => (
                            <span
                              className={`rounded px-2 py-1 text-xs ${getStatusColor(event.status)}`}
                              key={idx}
                            >
                              {event.name} • {event.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
