"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/user-avatar";
import { api } from "~/trpc/react";
import { MentionTextarea } from "./mention-textarea";

interface CommentActivityProps {
  activity: {
    id: number;
    content: string | null;
    isEdited: boolean;
    editedAt: Date | null;
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

// Helper to highlight @mentions in text
function highlightMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span className="font-medium" key={i} style={{ color: "#755BFF" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export function CommentActivity({
  activity,
  currentUserId,
  onUpdate,
}: CommentActivityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(activity.content ?? "");

  const utils = api.useUtils();

  const updateComment = api.activity.updateComment.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      onUpdate?.();
      void utils.activity.invalidate();
    },
  });

  const deleteComment = api.activity.deleteComment.useMutation({
    onSuccess: () => {
      onUpdate?.();
      void utils.activity.invalidate();
    },
  });

  const handleSave = () => {
    if (!editContent.trim()) return;
    updateComment.mutate({
      id: activity.id,
      content: editContent,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({ id: activity.id });
    }
  };

  const isOwner = activity.user.id === currentUserId;

  if (!activity.content) return null;

  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0">
        <UserAvatar
          image={activity.user.image}
          name={activity.user.name}
          size="md"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground text-sm">
          {activity.user.name}
        </p>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <MentionTextarea
              disabled={updateComment.isPending}
              onChange={setEditContent}
              rows={3}
              value={editContent}
            />
            <div className="flex gap-2">
              <Button
                disabled={updateComment.isPending || !editContent.trim()}
                onClick={handleSave}
                size="sm"
              >
                Save
              </Button>
              <Button
                disabled={updateComment.isPending}
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(activity.content ?? "");
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap text-foreground text-sm">
              {highlightMentions(activity.content)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
              <span>
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {activity.isEdited && <span>• edited</span>}
              {isOwner && (
                <>
                  <button
                    className="hover:opacity-80"
                    style={{ color: "#755BFF" }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="hover:opacity-80"
                    style={{ color: "#FF7044" }}
                    disabled={deleteComment.isPending}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
