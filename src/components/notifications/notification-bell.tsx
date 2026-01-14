"use client";

import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { api } from "~/trpc/react";
import { NotificationList } from "./notification-list";

export function NotificationBell() {
  const { data: unreadCount } = api.notification.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Poll every 30 seconds
    },
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <NotificationList />
      </SheetContent>
    </Sheet>
  );
}
