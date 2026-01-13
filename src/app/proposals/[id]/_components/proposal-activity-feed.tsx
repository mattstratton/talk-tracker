"use client";

import { CommentForm } from "~/components/activity/comment-form";
import { ActivityFeed } from "~/components/activity/activity-feed";

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
        <ActivityFeed proposalId={proposalId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
