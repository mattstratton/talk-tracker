"use client";

import { ActivityFeed } from "~/components/activity/activity-feed";
import { CommentForm } from "~/components/activity/comment-form";

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
        <ActivityFeed currentUserId={currentUserId} talkId={talkId} />
      </div>
    </div>
  );
}
