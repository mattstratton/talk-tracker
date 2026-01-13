"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UserAvatar } from "~/components/user-avatar";
import { api } from "~/trpc/react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "text-green-700";
    case "rejected":
      return "text-red-700";
    case "submitted":
      return "text-blue-700";
    case "draft":
      return "text-gray-700";
    default:
      return "text-gray-700";
  }
};

export function RecentActivityWidget() {
  const { data: activities, isLoading } = api.activity.getRecent.useQuery({
    limit: 5,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg text-gray-900">
            Recent Activity
          </CardTitle>
          <Link
            href="/activity"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="py-4 text-center text-gray-500 text-sm">
            No activity yet
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/proposals/${activity.proposal.id}`}
              >
                <div className="border-b pb-3 last:border-0 transition-colors hover:bg-gray-50">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <UserAvatar
                        name={activity.user.name}
                        image={activity.user.image}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {activity.activityType === "status_change" ? (
                        <>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>{" "}
                            changed status from{" "}
                            <span
                              className={`font-medium ${getStatusColor(activity.oldStatus ?? "")}`}
                            >
                              {activity.oldStatus}
                            </span>{" "}
                            to{" "}
                            <span
                              className={`font-medium ${getStatusColor(activity.newStatus ?? "")}`}
                            >
                              {activity.newStatus}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {activity.proposal.talk.title} •{" "}
                            {activity.proposal.event.name}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>{" "}
                            commented on proposal
                          </p>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {activity.proposal.talk.title} •{" "}
                            {activity.proposal.event.name}
                          </p>
                        </>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
