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
        utils.notification.getUnreadCount.setData(undefined, context.previousCount);
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
        utils.notification.getUnreadCount.setData(undefined, context.previousCount);
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
    return <div className="py-8 text-center text-sm text-gray-500">Loading...</div>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending}
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={notification.linkUrl}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div
              className={`rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                notification.isRead ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-2">
                {notification.actor && (
                  <UserAvatar
                    name={notification.actor.name}
                    image={notification.actor.image}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
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
