"use client";

import { DollarSign, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
    budget: number | null;
    sponsorshipTier: string | null;
  }>;
};

interface ParticipationSpendingProps {
  events: Event[];
}

export function ParticipationSpending({ events }: ParticipationSpendingProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Calculate spending by participation type
  const spendingByType: Record<string, number> = {};
  let totalSpending = 0;
  let confirmedSpending = 0;
  let interestedSpending = 0;

  events.forEach((event) => {
    event.participations?.forEach((p) => {
      if (p.budget) {
        totalSpending += p.budget;

        if (p.status === "confirmed") {
          confirmedSpending += p.budget;
        } else if (p.status === "interested") {
          interestedSpending += p.budget;
        }

        if (!spendingByType[p.participationType]) {
          spendingByType[p.participationType] = 0;
        }
        spendingByType[p.participationType] =
          (spendingByType[p.participationType] || 0) + p.budget;
      }
    });
  });

  const participationTypeLabels: Record<string, string> = {
    speak: "Speaking",
    sponsor: "Sponsoring",
    attend: "Attending",
    exhibit: "Exhibiting",
    volunteer: "Volunteering",
  };

  const typeColors: Record<string, string> = {
    speak: "bg-purple-500",
    sponsor: "bg-orange-500",
    attend: "bg-blue-500",
    exhibit: "bg-cyan-500",
    volunteer: "bg-teal-500",
  };

  const spendingBreakdown = Object.entries(spendingByType)
    .map(([type, amount]) => ({
      type,
      label: participationTypeLabels[type] || type,
      amount,
      percentage:
        totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
      color: typeColors[type] || "bg-gray-500",
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top spending events
  const topSpendingEvents = events
    .map((event) => {
      const eventSpending =
        event.participations?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      return {
        ...event,
        totalSpending: eventSpending,
      };
    })
    .filter((e) => e.totalSpending > 0)
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 5);

  if (totalSpending === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Participation Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-600 text-sm">
            No participation budgets set yet. Add budgets to company
            participations to track spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Participation Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700 text-xs">
                  Total Budget
                </span>
              </div>
              <div className="font-bold text-2xl text-blue-700">
                {formatCurrency(totalSpending)}
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-700 text-xs">
                  Confirmed
                </span>
              </div>
              <div className="font-bold text-2xl text-green-700">
                {formatCurrency(confirmedSpending)}
              </div>
              <div className="text-gray-600 text-xs">
                {totalSpending > 0
                  ? Math.round((confirmedSpending / totalSpending) * 100)
                  : 0}
                % of total
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700 text-xs">
                  Interested
                </span>
              </div>
              <div className="font-bold text-2xl text-gray-700">
                {formatCurrency(interestedSpending)}
              </div>
              <div className="text-gray-600 text-xs">
                {totalSpending > 0
                  ? Math.round((interestedSpending / totalSpending) * 100)
                  : 0}
                % of total
              </div>
            </div>
          </div>

          {/* Spending by Type */}
          {spendingBreakdown.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium text-gray-900 text-sm">
                Spending by Participation Type
              </h4>
              <div className="space-y-3">
                {spendingBreakdown.map((item) => (
                  <div key={item.type}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(item.amount)}{" "}
                        <span className="text-gray-600 text-xs">
                          ({item.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full ${item.color} transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Spending Events */}
          {topSpendingEvents.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium text-gray-900 text-sm">
                Top Spending Events
              </h4>
              <div className="space-y-2">
                {topSpendingEvents.map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id}>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                      <span className="font-medium text-gray-900 text-sm">
                        {event.name}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(event.totalSpending)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
