"use client";

import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface AnalyticsOverviewProps {
  totalProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  pendingProposals: number;
  totalEvents: number;
  upcomingEvents: number;
  totalParticipationBudget: number;
  totalTalks: number;
}

export function AnalyticsOverview({
  totalProposals,
  acceptedProposals,
  rejectedProposals,
  pendingProposals,
  totalEvents,
  upcomingEvents,
  totalParticipationBudget,
  totalTalks,
}: AnalyticsOverviewProps) {
  const acceptanceRate =
    totalProposals > 0
      ? ((acceptedProposals / totalProposals) * 100).toFixed(1)
      : "0";

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Overall Acceptance Rate */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 flex-1 font-medium text-xs sm:text-sm">Acceptance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 shrink-0" style={{ color: "#14D7C6" }} />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-xl sm:text-2xl" style={{ color: "#14D7C6" }}>
            {acceptanceRate}%
          </div>
          <p className="text-muted-foreground text-xs break-words">
            {acceptedProposals} of {totalProposals} proposals accepted
          </p>
        </CardContent>
      </Card>

      {/* Total Proposals */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 flex-1 font-medium text-xs sm:text-sm">Total Proposals</CardTitle>
          <div className="flex shrink-0 gap-1">
            <div className="h-4 w-1 rounded" style={{ backgroundColor: "#14D7C6" }} />
            <div className="h-4 w-1 rounded" style={{ backgroundColor: "#FF7044" }} />
            <div className="h-4 w-1 rounded" style={{ backgroundColor: "#755BFF" }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-xl sm:text-2xl">{totalProposals}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span style={{ color: "#14D7C6" }}>{acceptedProposals} accepted</span>
            <span style={{ color: "#FF7044" }}>{rejectedProposals} rejected</span>
            <span style={{ color: "#755BFF" }}>{pendingProposals} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 flex-1 font-medium text-xs sm:text-sm">Events</CardTitle>
          <Calendar className="h-4 w-4 shrink-0" style={{ color: "#755BFF" }} />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-xl sm:text-2xl">{totalEvents}</div>
          <p className="text-muted-foreground text-xs">{upcomingEvents} upcoming</p>
        </CardContent>
      </Card>

      {/* Participation Budget */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 flex-1 font-medium text-xs sm:text-sm">
            Participation Budget
          </CardTitle>
          <DollarSign className="h-4 w-4 shrink-0" style={{ color: "#FF7044" }} />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-xl sm:text-2xl break-words">
            {totalParticipationBudget > 0
              ? formatCurrency(totalParticipationBudget)
              : "$0"}
          </div>
          <p className="text-muted-foreground text-xs">{totalTalks} unique talks</p>
        </CardContent>
      </Card>
    </div>
  );
}
