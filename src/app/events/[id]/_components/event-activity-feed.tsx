"use client";

import { CommentForm } from "~/components/activity/comment-form";
import { ActivityFeed } from "~/components/activity/activity-feed";

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
        <ActivityFeed eventId={eventId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
