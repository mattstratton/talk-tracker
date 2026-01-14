"use client";

import { ActivityFeed } from "~/components/activity/activity-feed";
import { CommentForm } from "~/components/activity/comment-form";

interface ProposalActivityFeedProps {
  proposalId: number;
  currentUserId: string;
}

export function ProposalActivityFeed({
  proposalId,
  currentUserId,
}: ProposalActivityFeedProps) {
  return (
    <div className="space-y-6">
      <CommentForm proposalId={proposalId} />
      <div className="border-t">
        <ActivityFeed currentUserId={currentUserId} proposalId={proposalId} />
      </div>
    </div>
  );
}
