"use client";

import { StatusChangeActivity } from "./status-change-activity";
import { CommentActivity } from "./comment-activity";

interface ActivityItemProps {
  activity: {
    id: number;
    activityType: string;
    content: string | null;
    isEdited: boolean;
    editedAt: Date | null;
    oldStatus: string | null;
    newStatus: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
    mentions: Array<{
      id: number;
      mentionedUser: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  };
  currentUserId: string;
  onUpdate?: () => void;
}

export function ActivityItem({
  activity,
  currentUserId,
  onUpdate,
}: ActivityItemProps) {
  if (activity.activityType === "status_change") {
    return <StatusChangeActivity activity={activity} />;
  }

  if (activity.activityType === "comment") {
    return (
      <CommentActivity
        activity={activity}
        currentUserId={currentUserId}
        onUpdate={onUpdate}
      />
    );
  }

  return null;
}
