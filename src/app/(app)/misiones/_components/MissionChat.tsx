"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import es from "javascript-time-ago/locale/es";
import { ArrowDown, Send } from "lucide-react";
import { useSession } from "next-auth/react";

import { api } from "@/trpc/react";
// import { pusherClient } from "@/lib/pusher";
// import { NOTIFICATION_TYPES_MAP } from "@/lib/notifications";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { type InferSelectModel } from "drizzle-orm";
import { type messages } from "@/server/db/schema";
// import { toast } from "sonner";

TimeAgo.addDefaultLocale(es);

export default function MissionChat({
  reviewId,
  missionId,
  title,
  className,
  closed = false,
  otherEnd,
}: {
  reviewId: string;
  missionId?: string;
  title: string;
  className?: string;
  closed?: boolean;
  otherEnd?: string;
}) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const userId = session?.user.id;
  const [message, setMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const closeToBottom = scrollHeight < scrollTop + clientHeight + 100;
      if (!closeToBottom) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }
  };

  const [reviewMessages] = api.message.getReviewMessages.useSuspenseQuery({
    reviewId,
  });

  const { mutateAsync: createMessage, isPending: isCreatingMessage } =
    api.message.createMessage.useMutation({
      onSettled: async () => {
        await utils.message.getReviewMessages.invalidate({ reviewId });
        scrollToBottom();
      },
      onError: (error) => {
        console.error("Error creating message:", error);
      },
    });

  // const { mutateAsync: createNotification } =
  //   api.notification.createNotification.useMutation({
  //     onError: (error) => {
  //       console.error(error);
  //       toast.error("Ocurrió un error al enviar el mensaje");
  //     },
  //   });

  const handleSendMessage = async () => {
    if (!missionId || !otherEnd) return;
    await createMessage({ reviewId, content: message });
    // await createNotification({
    //   type: "missionMessage",
    //   resourceId: missionId,
    //   userId: otherEnd,
    //   content:
    //     NOTIFICATION_TYPES_MAP.missionMessage?.message({
    //       senderName: (session?.user.name ?? session?.user.username)!,
    //       missionTitle: title,
    //     }) ?? "",
    // });
    setMessage("");
  };

  // useEffect(() => {
  //   pusherClient.subscribe(`review-${reviewId}`);
  //   pusherClient.bind("incoming-message", async () => {
  //     await utils.message.getReviewMessages.invalidate({ reviewId });
  //   });

  //   return () => {
  //     pusherClient.unsubscribe(`review-${reviewId}`);
  //     pusherClient.unbind("incoming-message");
  //   };
  // }, [reviewId, utils]);

  useEffect(() => {
    scrollToBottom();
  }, [reviewId, reviewMessages]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative p-0">
        <ScrollArea className="h-[400px] flex-grow">
          <ScrollAreaViewport
            className="flex flex-col px-6 py-5"
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            {showScrollButton && (
              <Button
                variant="warning"
                size="icon"
                className="animate-slide-up absolute bottom-6 left-1/2 z-50 transform"
                style={{
                  transform: "translate(-50%, 0)",
                }}
                onClick={scrollToBottom}
              >
                <ArrowDown size={16} />
              </Button>
            )}
            {reviewMessages?.map((message, index) => (
              <MessageBubble key={index} message={message} userId={userId!} />
            ))}
          </ScrollAreaViewport>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <div className="border-t p-6">
          <div className="flex space-x-2">
            <Textarea
              disabled={!reviewId || closed || isCreatingMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  await handleSendMessage();
                }
              }}
              placeholder="Escribe tu mensaje aqui..."
              className="min-h-[120px] flex-grow"
              rows={3}
            />
            <div className="flex flex-col space-y-2">
              <Button
                disabled={
                  !reviewId ||
                  message.length === 0 ||
                  closed ||
                  isCreatingMessage
                }
                onClick={handleSendMessage}
                variant="default"
                size="icon"
                className="rounded-full"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionChatSkeleton() {
  return (
    <div className="md:col-span-3">
      <div className="mt-4 flex h-[400px] w-full flex-col gap-2 p-6">
        <Skeleton className="h-8 w-[75%] self-end" />
        <Skeleton className="h-8 w-[75%]" />
        <Skeleton className="h-8 w-[75%] self-end" />
        <Skeleton className="h-8 w-[75%]" />
        <Skeleton className="h-8 w-[75%] self-end" />
      </div>
      <Separator className="w-full" />

      <div className="flex w-full space-x-2 p-6">
        <Skeleton className="min-h-[120px] flex-grow" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

type MessageBubbleProps = {
  message: InferSelectModel<typeof messages>;
  userId: string;
};

const MessageBubble = ({ message, userId }: MessageBubbleProps) => {
  return (
    <div
      key={message.id}
      className={cn(
        "flex",
        message.senderId === userId
          ? "justify-end rounded-tr-none"
          : "justify-start rounded-tl-none",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "z-40 my-1 max-w-[75%] rounded-lg px-4 py-2",
              message.senderId === userId
                ? "justify-end rounded-tr-none"
                : "justify-start rounded-tl-none",
              message.senderId === userId
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent side={message.senderId === userId ? "left" : "right"}>
          <ReactTimeAgo date={message.createdAt} locale="es-ES" />
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
