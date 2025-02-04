import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
// import type { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm/sql";
import { messages } from "@/server/db/schema";
// import { pusherServer } from "@/server/pusher";

// type MessageType = InferInsertModel<typeof messages>;

export const messageRouter = createTRPCRouter({
  getReviewMessages: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reviewMessages = await ctx.db.query.messages.findMany({
        where: eq(messages.reviewId, input.reviewId),
      });

      return reviewMessages;
    }),

  createMessage: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newMessage] = await ctx.db
        .insert(messages)
        .values({
          reviewId: input.reviewId,
          senderId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      // await pusherServer.trigger(
      //   `review-${input.reviewId}`,
      //   "incoming-message",
      //   {
      //     message: newMessage,
      //   },
      // );

      return newMessage;
    }),
});
