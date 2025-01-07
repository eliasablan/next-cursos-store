import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq, desc, and } from "drizzle-orm";
import {
  // conversations,
  notifications,
  notificationTypes,
} from "~/server/db/schema";
import { pusherServer } from "~/server/pusher";
// import { TRPCError } from "@trpc/server";

export const notificationsRouter = createTRPCRouter({
  getPaginatedNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 5;
      const cursor = input.cursor ?? 1;

      const userNotifications = await ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.session.user.id),
        orderBy: desc(notifications.createdAt),
        limit,
        offset: (cursor - 1) * limit,
      });

      const nextCursor =
        userNotifications.length === limit ? cursor + 1 : undefined;

      return { userNotifications, nextCursor };
    }),

  getLastestNotifications: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const latestNotifications = await ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, user.id),
        orderBy: desc(notifications.createdAt),
        limit: input?.limit ?? 5,
      });

      if (!latestNotifications) {
        return undefined;
      }

      return latestNotifications;
    }),

  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    const unreadNotifications = await ctx.db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, ctx.session.user.id),
        eq(notifications.isRead, false),
      ),
      orderBy: desc(notifications.createdAt),
    });

    return unreadNotifications;
  }),

  createNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(notificationTypes.enumValues),
        userId: z.string(),
        resourceId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { type, userId, resourceId, content } = input;

      const [newNotification] = await ctx.db
        .insert(notifications)
        .values({
          type,
          userId,
          resourceId,
          content,
        })
        .returning();

      await pusherServer.trigger(userId, "notifications:new", newNotification);

      return newNotification;
    }),

  changeStatus: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
        isRead: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { notificationId, isRead } = input;

      const [updatedNotification] = await ctx.db
        .update(notifications)
        .set({
          isRead,
        })
        .where(and(eq(notifications.id, notificationId)))
        .returning();

      await pusherServer.trigger(
        ctx.session.user.id,
        "notifications:read",
        updatedNotification,
      );
      return updatedNotification;
    }),

  // getConversationNotifications: protectedProcedure
  //   .input(
  //     z.object({
  //       conversationId: z.string(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const conversation = await ctx.db.query.conversations.findFirst({
  //       where: eq(conversations.id, input.conversationId),
  //     });

  //     if (!conversation) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Conversación no encontrada",
  //       });
  //     }

  //     const conversationNotifications =
  //       await ctx.db.query.notifications.findMany({
  //         where: and(
  //           eq(notifications.resourceId, input.conversationId),
  //           eq(notifications.userId, ctx.session.user.id),
  //           eq(notifications.isRead, false),
  //         ),
  //       });

  //     return conversationNotifications;
  //   }),
});
