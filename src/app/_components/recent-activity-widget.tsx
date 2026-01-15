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
      return "text-[#14D7C6]"; // Teal
    case "rejected":
      return "text-[#FF7044]"; // Tiger Blood
    case "submitted":
      return "text-[#755BFF]"; // Vivid Purple
    case "draft":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
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
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-foreground sm:text-lg">
            Recent Activity
          </CardTitle>
          <Link
            className="text-sm hover:opacity-80"
            href="/activity"
            style={{ color: "#755BFF" }}
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            No activity yet
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link href={getActivityLink(activity)} key={activity.id}>
                <div className="border-b border-border pb-3 transition-colors last:border-0 hover:bg-muted">
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
                          <p className="text-foreground text-sm">
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
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {getEntityDescription(activity)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-foreground text-sm">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>{" "}
                            commented on {getCommentContext(activity)}
                          </p>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {getEntityDescription(activity)}
                          </p>
                        </>
                      )}
                      <p className="mt-0.5 text-muted-foreground text-xs">
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
