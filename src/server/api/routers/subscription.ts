import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { subscriptions } from "@/server/db/schema";

export const subscriptionRouter = createTRPCRouter({
  isSubscribed: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, ctx.session.user.id),
        ),
      });

      if (!response) {
        return { active: false };
      }

      return response;
    }),

  changeSuscribeStatus: protectedProcedure
    .input(z.object({ courseId: z.string().min(1), subscribing: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, ctx.session.user.id),
        ),
      });

      if (subscription) {
        await ctx.db
          .update(subscriptions)
          .set({
            active: input.subscribing,
          })
          .where(eq(subscriptions.id, subscription.id));
      } else {
        await ctx.db.insert(subscriptions).values({
          courseId: input.courseId,
          studentId: ctx.session.user.id,
        });
      }
    }),
});
