"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, Calendar, Check, GitBranch, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";

function getNotificationIcon(type: string) {
  switch (type) {
    case "mention":
      return <Bell className="h-5 w-5 text-blue-500" />;
    case "comment":
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case "status_change":
      return <GitBranch className="h-5 w-5 text-purple-500" />;
    case "cfp_deadline":
      return <Calendar className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
}

export function NotificationFeed() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const utils = api.useUtils();
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.notification.getAll.useInfiniteQuery(
    { limit: 20, unreadOnly },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      void utils.notification.getUnreadCount.invalidate();
      void utils.notification.getAll.invalidate();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      void utils.notification.getUnreadCount.invalidate();
      void utils.notification.getAll.invalidate();
    },
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead && !markAsReadMutation.isPending) {
      markAsReadMutation.mutate({ id });
    }
  };

  const handleMarkAllAsRead = () => {
    if (!markAllAsReadMutation.isPending) {
      markAllAsReadMutation.mutate();
    }
  };

  const allNotifications =
    data?.pages.flatMap((page) => page.notifications) ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600">Error loading notifications</p>
          <p className="mt-2 text-gray-500 text-sm">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setUnreadOnly(false)}
            size="sm"
            variant={!unreadOnly ? "default" : "outline"}
          >
            All
          </Button>
          <Button
            onClick={() => setUnreadOnly(true)}
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
          >
            Unread
          </Button>
        </div>
        <Button
          disabled={
            markAllAsReadMutation.isPending || allNotifications.length === 0
          }
          onClick={handleMarkAllAsRead}
          size="sm"
          variant="outline"
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {allNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              {unreadOnly
                ? "You're all caught up!"
                : "You'll see notifications here when you get mentioned, when proposal statuses change, and more."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {allNotifications.map((notification) => (
              <Link
                href={notification.linkUrl}
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.isRead)
                }
              >
                <Card
                  className={`transition-colors hover:bg-gray-50 ${
                    !notification.isRead
                      ? "border-l-4 border-l-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-gray-600 text-sm">
                            {notification.message}
                          </p>
                        </div>
                        {notification.actor && (
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600 text-xs">
                              {notification.actor.name?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div className="py-4 text-center" ref={observerRef}>
            {isFetchingNextPage ? (
              <p className="text-gray-500 text-sm">Loading more...</p>
            ) : hasNextPage ? (
              <p className="text-gray-400 text-sm">Scroll for more</p>
            ) : allNotifications.length > 0 ? (
              <p className="text-gray-400 text-sm">No more notifications</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
