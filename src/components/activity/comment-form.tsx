"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { MentionTextarea } from "./mention-textarea";
import { api } from "~/trpc/react";

interface CommentFormProps {
  proposalId?: number;
  eventId?: number;
  talkId?: number;
  onSuccess?: () => void;
}

export function CommentForm({
  proposalId,
  eventId,
  talkId,
  onSuccess,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const utils = api.useUtils();

  const createComment = api.activity.createComment.useMutation({
    onSuccess: () => {
      setContent("");
      onSuccess?.();
      void utils.activity.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment.mutate({
      proposalId,
      eventId,
      talkId,
      content: content.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <MentionTextarea
          value={content}
          onChange={setContent}
          placeholder="Add a comment... Type @ to mention someone"
          rows={3}
          disabled={createComment.isPending}
        />
        <p className="mt-1 text-xs text-gray-500">
          Tip: Type @ to see team members you can mention
        </p>
      </div>
      <Button
        type="submit"
        disabled={createComment.isPending || !content.trim()}
      >
        {createComment.isPending ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
