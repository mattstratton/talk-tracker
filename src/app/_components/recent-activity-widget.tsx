"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
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

  // Helper to get the link for an activity
  const getActivityLink = (activity: any) => {
    if (activity.proposal) return `/proposals/${activity.proposal.id}`;
    if (activity.event) return `/events/${activity.event.id}`;
    if (activity.talk) return `/talks/${activity.talk.id}`;
    return "#";
  };

  // Helper to get the entity description
  const getEntityDescription = (activity: any) => {
    if (activity.proposal) {
      return `${activity.proposal.talk.title} • ${activity.proposal.event.name}`;
    }
    if (activity.event) {
      return `Event: ${activity.event.name}`;
    }
    if (activity.talk) {
      return `Talk: ${activity.talk.title}`;
    }
    return "";
  };

  // Helper to get comment context
  const getCommentContext = (activity: any) => {
    if (activity.proposal) return "proposal";
    if (activity.event) return "event";
    if (activity.talk) return "talk";
    return "item";
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-gray-900 sm:text-lg">
            Recent Activity
          </CardTitle>
          <Link
            className="text-blue-600 text-sm hover:text-blue-700"
            href="/activity"
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
              <Link href={getActivityLink(activity)} key={activity.id}>
                <div className="border-b pb-3 transition-colors last:border-0 hover:bg-gray-50">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <UserAvatar
                        image={activity.user.image}
                        name={activity.user.name}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {activity.activityType === "status_change" ? (
                        <>
                          <p className="text-gray-900 text-sm">
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
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {getEntityDescription(activity)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-900 text-sm">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>{" "}
                            commented on {getCommentContext(activity)}
                          </p>
                          <p className="mt-0.5 text-gray-600 text-xs">
                            {getEntityDescription(activity)}
                          </p>
                        </>
                      )}
                      <p className="mt-0.5 text-gray-500 text-xs">
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
