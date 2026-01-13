"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "~/components/ui/button";
import { MentionTextarea } from "./mention-textarea";
import { UserAvatar } from "~/components/user-avatar";
import { api } from "~/trpc/react";

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
        <span key={i} className="font-medium text-blue-600">
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
          name={activity.user.name}
          image={activity.user.image}
          size="md"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <MentionTextarea
              value={editContent}
              onChange={setEditContent}
              rows={3}
              disabled={updateComment.isPending}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateComment.isPending || !editContent.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(activity.content ?? "");
                }}
                disabled={updateComment.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {highlightMentions(activity.content)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span>
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {activity.isEdited && <span>• edited</span>}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteComment.isPending}
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
