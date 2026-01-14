"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { MentionTextarea } from "./mention-textarea";

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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <MentionTextarea
          disabled={createComment.isPending}
          onChange={setContent}
          placeholder="Add a comment... Type @ to mention someone"
          rows={3}
          value={content}
        />
        <p className="mt-1 text-gray-500 text-xs">
          Tip: Type @ to see team members you can mention
        </p>
      </div>
      <Button
        disabled={createComment.isPending || !content.trim()}
        type="submit"
      >
        {createComment.isPending ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
