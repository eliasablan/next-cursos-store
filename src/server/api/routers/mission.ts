import { createTRPCRouter, protectedProcedure } from "../trpc";
import { subscriptions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const missionRouter = createTRPCRouter({
  getStudentReviews: protectedProcedure.query(async ({ ctx }) => {
    const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
      where: and(eq(subscriptions.studentId, ctx.session.user.id)),
      with: {
        reviews: {
          with: {
            mission: true,
            // conversation: true,
          },
        },
      },
    });
    const reviews = studentSubscriptions?.flatMap((studentSubscription) => {
      return studentSubscription.reviews.flatMap((review) => {
        const now = new Date();
        const deadline = review.mission?.deadline;
        const extension = review?.extension;

        let status = "closed";
        if (!extension && deadline && deadline > now) {
          status = "open";
        } else if (extension && extension > now) {
          status = "extended";
        }

        return { status, ...review };
      });
    });

    return reviews;
  }),
});
