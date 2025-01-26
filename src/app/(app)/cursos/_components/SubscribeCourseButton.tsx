"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function SubscribeCourseButton({
  courseId,
}: {
  courseId: string;
}) {
  const utils = api.useUtils();

  const { data: subscription, isLoading } = api.subs.isSubscribed.useQuery({
    courseId: courseId,
  });

  const { mutateAsync: subscribe, isPending } =
    api.subs.changeSuscribeStatus.useMutation({
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: async () => {
        await utils.subs.isSubscribed.invalidate({ courseId });
        if (subscription?.active) {
          toast.success("Subscripcion desactivada");
        } else {
          toast.success("Subscripcion activada");
        }
      },
    });

  return (
    <Button
      disabled={isPending || isLoading}
      variant={subscription?.active ? "secondary" : "destructive"}
      onClick={() =>
        subscribe({ courseId, subscribing: !subscription?.active })
      }
    >
      {isPending ? (
        <Loader className="animate-spin" />
      ) : subscription?.active ? (
        "Cancelar subscripción"
      ) : (
        "Inscribir"
      )}
    </Button>
  );
}
