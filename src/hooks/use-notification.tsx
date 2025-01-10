"use client";

import { api } from "@/trpc/react";
import { useCallback } from "react";
import { toast } from "sonner";
import { type NotificationTypeEnum } from "@/server/db/schema";

export function useNotification({ type }: { type: NotificationTypeEnum }) {
  const { mutateAsync: createNotification } =
    api.notification.createNotification.useMutation({
      onError: (error) => {
        console.error(error);
        toast.error("Ha ocurrido un error al enviar la notificación.", {
          position: "bottom-left",
        });
      },
    });

  const sendNotification = useCallback(
    async ({
      message,
      notifyedUsersIds,
      resourceId,
    }: {
      message: string;
      notifyedUsersIds: string[];
      resourceId: string;
    }) => {
      const notificationPromises = notifyedUsersIds.map((userId) =>
        createNotification({
          type,
          userId,
          resourceId,
          content: message,
        }),
      );

      await Promise.allSettled(notificationPromises);
    },
    [createNotification, type],
  );
  return { sendNotification };
}
