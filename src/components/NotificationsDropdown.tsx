"use client";

import React, {
  // useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { Bell, ArrowRight, CircleDot, Circle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  // DropdownMenuShortcut,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NOTIFICATION_TYPES_MAP } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useEffect } from "react";
// import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
// import { pusherClient } from "@/lib/pusher";
// import { useReadNotifications } from "@/hooks/use-read-notifications";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NotificationsDropdown() {
  const { data: session } = useSession();
  // const pathname = usePathname();

  const utils = api.useUtils();

  const { data: unreadNotifications } =
    api.notification.getUnreadNotifications.useQuery();

  const { data: latestNotifications } =
    api.notification.getLastestNotifications.useQuery();

  const { mutateAsync: markAsRead } =
    api.notification.changeStatus.useMutation();

  // const pathRelatedNotifications = useMemo(() => {
  //   return latestNotifications?.filter((notification) => {
  //     const notificationRedirectUrl = NOTIFICATION_TYPES_MAP[
  //       notification.type
  //     ].redirectUrl({ resourceId: notification.resourceId });

  //     return !notification.isRead && notificationRedirectUrl === pathname;
  //   });
  // }, [pathname, latestNotifications]);

  // const { readNotifications } = useReadNotifications();

  // useEffect(() => {
  //   const markNotificationsAsRead = async () => {
  //     await readNotifications({
  //       notificationIds: pathRelatedNotifications!.map(
  //         (notification) => notification.id,
  //       ),
  //     });
  //   };

  //   if (pathRelatedNotifications) {
  //     markNotificationsAsRead().catch((error) => {
  //       console.error(error);
  //     });
  //   }
  // }, [pathRelatedNotifications, readNotifications]);

  const notificationsEventHandler = useCallback(async () => {
    await utils.notification.getLastestNotifications.invalidate();
    await utils.notification.getUnreadNotifications.invalidate();
  }, [utils]);

  // Subscribes to notifications channel and listen to notifications events
  // useEffect(() => {
  //   if (session) {
  //     pusherClient.subscribe(session.user.id);
  //     pusherClient.bind("notifications:new", notificationsEventHandler);
  //     pusherClient.bind("notifications:read", notificationsEventHandler);
  //   }

  //   return () => {
  //     pusherClient.unsubscribe("notifications");
  //     pusherClient.unbind("notifications:new");
  //     pusherClient.unbind("notifications:read");
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative size-10 md:size-9"
        >
          <Bell className="size-6 stroke-2" />
          {unreadNotifications && unreadNotifications?.length > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold">
              {unreadNotifications?.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <Link href="/notificaciones">Notificaciones</Link>
          {/* <DropdownMenuShortcut>⌘K</DropdownMenuShortcut> */}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {latestNotifications?.length === 0 && (
          <div className="text-muted-foreground my-4 text-center text-sm">
            No tienes ninguna notificación.
          </div>
        )}
        {latestNotifications?.map((notification) => {
          const notificationRedirectUrl = NOTIFICATION_TYPES_MAP[
            notification.type
          ]?.redirectUrl({ resourceId: notification.resourceId });

          return (
            <DropdownMenuItem
              key={notification.id}
              className="flex justify-between gap-2"
            >
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={async () => {
                      await markAsRead({
                        notificationId: notification.id,
                        isRead: !notification.isRead,
                      });
                    }}
                  >
                    {notification.isRead ? (
                      <Circle className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <CircleDot className="text-destructive h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>
                    {notification.isRead
                      ? "Marcar como no leído"
                      : "Marcar como leído"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="line-clamp-2 flex-1 text-left text-xs">
                {notification.content}
              </span>
              <Button variant="outline" size="icon" className="size-7" asChild>
                <Link href={notificationRedirectUrl!}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </DropdownMenuItem>
          );
        })}
        {/* <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex w-40 flex-row items-center justify-between">
          <Link href="/notificaciones">Ver todas las notificaciones</Link>
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuLabel> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
