"use client";

import { CommentForm } from "~/components/activity/comment-form";
import { ActivityFeed } from "~/components/activity/activity-feed";

interface TalkActivityFeedProps {
  talkId: number;
  currentUserId: string;
}

export function TalkActivityFeed({
  talkId,
  currentUserId,
}: TalkActivityFeedProps) {
  return (
    <div className="space-y-6">
      <CommentForm talkId={talkId} />
      <div className="border-t">
        <ActivityFeed talkId={talkId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
