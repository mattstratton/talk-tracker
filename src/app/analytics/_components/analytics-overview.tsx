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
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Acceptance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-green-600">
            {acceptanceRate}%
          </div>
          <p className="text-gray-600 text-xs">
            {acceptedProposals} of {totalProposals} proposals accepted
          </p>
        </CardContent>
      </Card>

      {/* Total Proposals */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Proposals</CardTitle>
          <div className="flex gap-1">
            <div className="h-4 w-1 rounded bg-green-500" />
            <div className="h-4 w-1 rounded bg-red-500" />
            <div className="h-4 w-1 rounded bg-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{totalProposals}</div>
          <div className="mt-1 flex gap-3 text-xs">
            <span className="text-green-600">{acceptedProposals} accepted</span>
            <span className="text-red-600">{rejectedProposals} rejected</span>
            <span className="text-blue-600">{pendingProposals} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Events</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{totalEvents}</div>
          <p className="text-gray-600 text-xs">{upcomingEvents} upcoming</p>
        </CardContent>
      </Card>

      {/* Participation Budget */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Participation Budget
          </CardTitle>
          <DollarSign className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {totalParticipationBudget > 0
              ? formatCurrency(totalParticipationBudget)
              : "$0"}
          </div>
          <p className="text-gray-600 text-xs">{totalTalks} unique talks</p>
        </CardContent>
      </Card>
    </div>
  );
}
