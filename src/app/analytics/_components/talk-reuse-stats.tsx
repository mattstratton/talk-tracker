"use client";

import { Repeat, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Talk = {
  id: number;
  title: string;
  createdBy: {
    name: string | null;
  };
};

type Proposal = {
  id: number;
  talkId: number;
  status: string;
  event: {
    name: string;
  };
};

interface TalkReuseStatsProps {
  talks: Talk[];
  proposals: Proposal[];
}

export function TalkReuseStats({ talks, proposals }: TalkReuseStatsProps) {
  // Calculate reuse statistics for each talk
  const talkReuseStats = talks
    .map((talk) => {
      const talkProposals = proposals.filter((p) => p.talkId === talk.id);
      const submissionCount = talkProposals.length;
      const acceptedCount = talkProposals.filter(
        (p) => p.status === "accepted" || p.status === "confirmed",
      ).length;

      return {
        ...talk,
        submissionCount,
        acceptedCount,
        events: talkProposals.map((p) => p.event.name),
      };
    })
    .filter((t) => t.submissionCount > 0)
    .sort((a, b) => b.submissionCount - a.submissionCount);

  const mostReusedTalks = talkReuseStats.slice(0, 10);
  const totalTalks = talks.length;
  const reusedTalks = talkReuseStats.filter(
    (t) => t.submissionCount > 1,
  ).length;
  const totalSubmissions = proposals.length;
  const averageReuse = totalTalks > 0 ? totalSubmissions / totalTalks : 0;

  if (mostReusedTalks.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Talk Reuse Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-600 text-sm">
            No proposals yet. Submit talks to events to see reuse statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Talk Reuse Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-purple-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-700 text-xs">
                  Average Reuse
                </span>
              </div>
              <div className="font-bold text-2xl text-purple-700">
                {averageReuse.toFixed(1)}x
              </div>
              <div className="text-gray-600 text-xs">submissions per talk</div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700 text-xs">
                  Reused Talks
                </span>
              </div>
              <div className="font-bold text-2xl text-blue-700">
                {reusedTalks}
              </div>
              <div className="text-gray-600 text-xs">
                {totalTalks > 0
                  ? Math.round((reusedTalks / totalTalks) * 100)
                  : 0}
                % of all talks
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium text-gray-700 text-xs">
                  Most Reused
                </span>
              </div>
              <div className="font-bold text-2xl text-green-700">
                {mostReusedTalks[0]?.submissionCount || 0}x
              </div>
              <div className="truncate text-gray-600 text-xs">
                {mostReusedTalks[0]?.title || "N/A"}
              </div>
            </div>
          </div>

          {/* Top Reused Talks */}
          <div>
            <h4 className="mb-3 font-medium text-gray-900 text-sm">
              Most Frequently Submitted Talks
            </h4>
            <div className="space-y-2">
              {mostReusedTalks.map((talk, index) => (
                <Link href={`/talks/${talk.id}`} key={talk.id}>
                  <div className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700 text-xs group-hover:bg-purple-100 group-hover:text-purple-700">
                            {index + 1}
                          </span>
                          <h5 className="truncate font-medium text-gray-900">
                            {talk.title}
                          </h5>
                        </div>
                        <p className="text-gray-600 text-xs">
                          by {talk.createdBy.name}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-bold text-purple-700 text-xl">
                          {talk.submissionCount}x
                        </div>
                        <div className="text-gray-600 text-xs">
                          {talk.acceptedCount} accepted
                        </div>
                      </div>
                    </div>

                    {/* Show event badges */}
                    {talk.events.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {talk.events.slice(0, 3).map((eventName, idx) => (
                          <span
                            className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 text-xs"
                            key={`${talk.id}-${eventName}-${idx}`}
                          >
                            {eventName}
                          </span>
                        ))}
                        {talk.events.length > 3 && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 text-xs">
                            +{talk.events.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
