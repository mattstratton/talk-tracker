"use client";

import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface ProposalsByStatusChartProps {
  accepted: number;
  rejected: number;
  submitted: number;
  draft: number;
}

export function ProposalsByStatusChart({
  accepted,
  rejected,
  submitted,
  draft,
}: ProposalsByStatusChartProps) {
  const total = accepted + rejected + submitted + draft;

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const statuses = [
    {
      label: "Accepted",
      count: accepted,
      percentage: getPercentage(accepted),
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      icon: CheckCircle,
    },
    {
      label: "Submitted",
      count: submitted,
      percentage: getPercentage(submitted),
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: Clock,
    },
    {
      label: "Rejected",
      count: rejected,
      percentage: getPercentage(rejected),
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      icon: XCircle,
    },
    {
      label: "Draft",
      count: draft,
      percentage: getPercentage(draft),
      color: "bg-gray-400",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      icon: FileText,
    },
  ];

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Proposals by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-gray-600 text-sm">
            No proposals yet. Create some proposals to see status breakdown.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Visual bar chart */}
            <div className="flex h-12 overflow-hidden rounded-lg">
              {statuses.map(
                (status) =>
                  status.count > 0 && (
                    <div
                      className={`${status.color} flex items-center justify-center transition-all`}
                      key={status.label}
                      style={{ width: `${status.percentage}%` }}
                      title={`${status.label}: ${status.count} (${status.percentage}%)`}
                    >
                      {status.percentage >= 10 && (
                        <span className="font-semibold text-white text-xs">
                          {status.percentage}%
                        </span>
                      )}
                    </div>
                  ),
              )}
            </div>

            {/* Legend with counts */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statuses.map((status) => {
                const Icon = status.icon;
                return (
                  <div
                    className={`rounded-lg p-3 ${status.bgColor}`}
                    key={status.label}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${status.textColor}`} />
                      <span className="font-medium text-gray-700 text-xs">
                        {status.label}
                      </span>
                    </div>
                    <div className={`font-bold text-2xl ${status.textColor}`}>
                      {status.count}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {status.percentage}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
