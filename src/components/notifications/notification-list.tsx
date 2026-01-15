"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/user-avatar";
import { api } from "~/trpc/react";

export function NotificationList() {
  const utils = api.useUtils();
  const { data: notifications, isLoading } =
    api.notification.getRecent.useQuery({
      limit: 10,
    });

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await utils.notification.getRecent.cancel();
      await utils.notification.getUnreadCount.cancel();

      // Snapshot the previous value
      const previousNotifications = utils.notification.getRecent.getData();
      const previousCount = utils.notification.getUnreadCount.getData();

      // Optimistically update to the new value
      utils.notification.getRecent.setData({ limit: 10 }, (old) => {
        if (!old) return old;
        return old.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification,
        );
      });

      utils.notification.getUnreadCount.setData(undefined, (old) => {
        return Math.max(0, (old ?? 0) - 1);
      });

      // Return a context object with the snapshotted value
      return { previousNotifications, previousCount };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        utils.notification.getRecent.setData(
          { limit: 10 },
          context.previousNotifications,
        );
      }
      if (context?.previousCount !== undefined) {
        utils.notification.getUnreadCount.setData(
          undefined,
          context.previousCount,
        );
      }
    },
    onSettled: () => {
      void utils.notification.getRecent.invalidate();
      void utils.notification.getUnreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches
      await utils.notification.getRecent.cancel();
      await utils.notification.getUnreadCount.cancel();

      // Snapshot the previous value
      const previousNotifications = utils.notification.getRecent.getData();
      const previousCount = utils.notification.getUnreadCount.getData();

      // Optimistically update to the new value
      utils.notification.getRecent.setData({ limit: 10 }, (old) => {
        if (!old) return old;
        return old.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date(),
        }));
      });

      utils.notification.getUnreadCount.setData(undefined, 0);

      // Return a context object with the snapshotted value
      return { previousNotifications, previousCount };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        utils.notification.getRecent.setData(
          { limit: 10 },
          context.previousNotifications,
        );
      }
      if (context?.previousCount !== undefined) {
        utils.notification.getUnreadCount.setData(
          undefined,
          context.previousCount,
        );
      }
    },
    onSettled: () => {
      void utils.notification.getRecent.invalidate();
      void utils.notification.getUnreadCount.invalidate();
    },
  });

  const handleNotificationClick = (id: number) => {
    if (!markAsReadMutation.isPending) {
      markAsReadMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">Loading...</div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-end">
        <Button
          disabled={markAllAsReadMutation.isPending}
          onClick={() => markAllAsReadMutation.mutate()}
          size="sm"
          variant="ghost"
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Link
            href={notification.linkUrl}
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div
              className={`rounded-lg border border-border p-3 transition-colors hover:bg-muted ${
                notification.isRead ? "bg-card" : "bg-[#755BFF]/10"
              }`}
            >
              <div className="flex items-start gap-2">
                {notification.actor && (
                  <UserAvatar
                    image={notification.actor.image}
                    name={notification.actor.name}
                    size="sm"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: "#755BFF" }} />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link href="/notifications">
          <Button size="sm" variant="outline">
            View All Notifications
          </Button>
        </Link>
      </div>
    </div>
  );
}
