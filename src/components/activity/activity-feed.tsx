"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ActivityItem } from "./activity-item";
import { api } from "~/trpc/react";

interface ActivityFeedProps {
  proposalId?: number;
  eventId?: number;
  talkId?: number;
  limit?: number;
  currentUserId: string;
}

export function ActivityFeed({
  proposalId,
  eventId,
  talkId,
  limit = 20,
  currentUserId,
}: ActivityFeedProps) {
  const [cursor, setCursor] = useState<number | undefined>();

  // Use different query based on entity type
  const query = proposalId
    ? api.activity.getByProposal.useQuery({
        proposalId,
        limit,
        cursor,
      })
    : eventId
      ? api.activity.getByEvent.useQuery({
          eventId,
          limit,
          cursor,
        })
      : talkId
        ? api.activity.getByTalk.useQuery({
            talkId,
            limit,
            cursor,
          })
        : api.activity.getAll.useQuery({
            limit,
            cursor,
          });

  const { data, isLoading, error, refetch } = query;

  if (isLoading && !cursor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">
          Error loading activities: {error.message}
        </div>
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No activity yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="divide-y divide-gray-200">
        {data.items.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            currentUserId={currentUserId}
            onUpdate={() => void refetch()}
          />
        ))}
      </div>

      {data.nextCursor && (
        <div className="flex justify-center border-t p-4">
          <Button
            variant="outline"
            onClick={() => setCursor(data.nextCursor)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
