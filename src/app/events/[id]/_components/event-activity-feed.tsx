"use client";

import { ActivityFeed } from "~/components/activity/activity-feed";
import { CommentForm } from "~/components/activity/comment-form";

interface EventActivityFeedProps {
  eventId: number;
  currentUserId: string;
}

export function EventActivityFeed({
  eventId,
  currentUserId,
}: EventActivityFeedProps) {
  return (
    <div className="space-y-6">
      <CommentForm eventId={eventId} />
      <div className="border-t">
        <ActivityFeed currentUserId={currentUserId} eventId={eventId} />
      </div>
    </div>
  );
}
