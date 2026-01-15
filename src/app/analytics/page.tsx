import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "~/components/app-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { AnalyticsOverview } from "./_components/analytics-overview";
import { EventsTimeline } from "./_components/events-timeline";
import { ParticipationSpending } from "./_components/participation-spending";
import { ProposalsByStatusChart } from "./_components/proposals-by-status-chart";
import { TalkReuseStats } from "./_components/talk-reuse-stats";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Track acceptance rates per talk, submission statistics, and identify which talks perform best at conferences.",
};

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [talks, proposals, events] = await Promise.all([
    api.talk.getAll(),
    api.proposal.getAll(),
    api.event.getAllWithScores(),
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
    if (rate >= 75) return "text-[#14D7C6]"; // Teal
    if (rate >= 50) return "text-[#F5FF80]"; // Electric Yellow
    if (rate > 0) return "text-[#FF7044]"; // Tiger Blood
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "bg-[#14D7C6] text-foreground"; // Teal
      case "rejected":
        return "bg-[#FF7044] text-white"; // Tiger Blood
      case "submitted":
        return "bg-[#755BFF] text-white"; // Vivid Purple
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <AppHeader />

        <div className="container mx-auto max-w-full px-4 sm:px-6 py-6 sm:py-8">
          {/* Overall Analytics Overview */}
          <AnalyticsOverview
            acceptedProposals={
              proposals.filter(
                (p) => p.status === "accepted" || p.status === "confirmed",
              ).length
            }
            pendingProposals={
              proposals.filter(
                (p) => p.status === "submitted" || p.status === "draft",
              ).length
            }
            rejectedProposals={
              proposals.filter((p) => p.status === "rejected").length
            }
            totalEvents={events.length}
            totalParticipationBudget={events.reduce((sum, event) => {
              const eventBudget =
                (event as any).participations?.reduce(
                  (total: number, p: any) => total + (p.budget || 0),
                  0,
                ) || 0;
              return sum + eventBudget;
            }, 0)}
            totalProposals={proposals.length}
            totalTalks={talks.length}
            upcomingEvents={
              events.filter((e) => {
                if (!e.startDate) return false;
                return new Date(e.startDate) > new Date();
              }).length
            }
          />

          {/* Proposals by Status Chart */}
          <div className="mb-8">
            <ProposalsByStatusChart
              accepted={
                proposals.filter(
                  (p) => p.status === "accepted" || p.status === "confirmed",
                ).length
              }
              draft={proposals.filter((p) => p.status === "draft").length}
              rejected={proposals.filter((p) => p.status === "rejected").length}
              submitted={
                proposals.filter((p) => p.status === "submitted").length
              }
            />
          </div>

          {/* Events Timeline and Spending */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <EventsTimeline events={events as any} />
            <ParticipationSpending events={events as any} />
          </div>

          {/* Talk Reuse Statistics */}
          <div className="mb-8">
            <TalkReuseStats proposals={proposals} talks={talks} />
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-1 font-semibold text-foreground text-xl sm:text-2xl">
              Talk Analytics
            </h2>
            <p className="text-muted-foreground text-sm">
              Track which talks are most successful and identify your strongest
              content
            </p>
          </div>

          {sortedTalkStats.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
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
                <Link href={`/talks/${talk.id}`} key={talk.id}>
                  <Card className="border-border transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-foreground text-lg">
                            {talk.title}
                          </CardTitle>
                          <p className="mt-1 text-muted-foreground text-sm">
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
                              <p className="text-muted-foreground text-xs">
                                acceptance rate
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Not submitted yet
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Total Submissions
                          </p>
                          <p className="font-semibold text-foreground text-lg sm:text-xl">
                            {talk.totalSubmissions}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Accepted</p>
                          <p className="font-semibold text-lg sm:text-xl" style={{ color: "#14D7C6" }}>
                            {talk.acceptedCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Rejected</p>
                          <p className="font-semibold text-lg sm:text-xl" style={{ color: "#FF7044" }}>
                            {
                              talk.events.filter((e) => e.status === "rejected")
                                .length
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Pending</p>
                          <p className="font-semibold text-lg sm:text-xl" style={{ color: "#755BFF" }}>
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
                          <h4 className="mb-2 font-medium text-foreground text-sm">
                            Submitted to:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {talk.events.map((event, idx) => (
                              <span
                                className={`rounded px-2 py-1 text-xs ${getStatusColor(event.status)}`}
                                key={`${talk.id}-${event.name}-${event.status}-${idx}`}
                              >
                                {event.name} • {event.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
