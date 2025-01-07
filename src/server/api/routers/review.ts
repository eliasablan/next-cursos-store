import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { reviews } from "@/server/db/schema";
import { z } from "zod";

export const reviewRouter = createTRPCRouter({
  extend: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        extension: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { reviewId, extension } = input;
      const { db } = ctx;

      const review = await db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
      });

      if (!review) {
        throw new Error("Review not found");
      }

      const [updatedReview] = await db
        .update(reviews)
        .set({ extension })
        .where(eq(reviews.id, reviewId))
        .returning();

      return updatedReview;
    }),

  qualify: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        qualification: z.number(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { reviewId, qualification, message } = input;
      const { db } = ctx;

      const review = await db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
      });

      if (!review) {
        throw new Error("Review not found");
      }

      const [updatedReview] = await db
        .update(reviews)
        .set({ score: qualification, teacherReview: message })
        .where(eq(reviews.id, reviewId))
        .returning();

      return updatedReview;
    }),
});
