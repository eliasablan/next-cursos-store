import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { reviewDocuments } from "@/server/db/schema";

export const reviewDocumentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        fileName: z.string(),
        reviewId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .insert(reviewDocuments)
        .values({
          name: input.fileName,
          reviewId: input.reviewId,
          fileUrl: input.fileUrl,
          uploadedBy: ctx.session.user.id,
        })
        .returning();

      return document;
    }),

  changeSolution: protectedProcedure
    .input(z.object({ id: z.string(), solution: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .update(reviewDocuments)
        .set({
          solution: input.solution,
        })
        .where(eq(reviewDocuments.id, input.id))
        .returning();

      return document;
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .update(reviewDocuments)
        .set({
          name: input.name,
        })
        .where(eq(reviewDocuments.id, input.id))
        .returning();

      return document;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(reviewDocuments)
        .where(eq(reviewDocuments.id, input.id));
    }),
});
