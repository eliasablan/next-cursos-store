import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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

  getSubscriptionByCourseId: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session) return null;

      const response = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, ctx.session.user.id),
        ),
        with: {
          reviews: {
            // with: {
            //   conversation: true,
            // },
          },
        },
      });

      return response;
    }),

  getStudentSubscriptions: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.subscriptions.findMany({
        where: eq(subscriptions.studentId, input.studentId),
        with: {
          course: true,
        },
      });

      return response.map((subscription) => {
        let status = "incoming";
        if (subscription.course.endDate < new Date()) {
          status = "finished";
        } else {
          if (subscription.course.startDate < new Date()) {
            status = "coursing";
          }
        }

        return {
          status,
          ...subscription,
        };
      });
    }),

  updateSubscriptionPayment: publicProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        paid: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedSubscription] = await ctx.db
        .update(subscriptions)
        .set({ paid: input.paid })
        .where(eq(subscriptions.id, input.subscriptionId))
        .returning();

      return updatedSubscription;
    }),
});
