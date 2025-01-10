import { api } from "@/trpc/react";
import { useCallback } from "react";

export function useReadNotifications() {
  const { mutateAsync: markAsRead } =
    api.notification.changeStatus.useMutation();

  const readNotifications = useCallback(
    async ({ notificationIds }: { notificationIds?: string[] }) => {
      if (notificationIds) {
        const markAsReadPromises = notificationIds.map(
          async (notificationId) => {
            await markAsRead({ notificationId, isRead: true });
          },
        );

        await Promise.allSettled(markAsReadPromises);
      }
    },
    [markAsRead],
  );

  return { readNotifications };
}
