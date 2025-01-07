import { and, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { subscriptions, courses as coursesSchema } from "@/server/db/schema";

export const searchRouter = createTRPCRouter({
  search: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.query.courses.findMany();
    const lessons = await ctx.db.query.lessons.findMany({
      with: {
        course: true,
      },
    });
    const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
      where: and(eq(subscriptions.studentId, ctx.session.user.id)),
      with: {
        reviews: {
          with: {
            mission: true,
          },
        },
      },
    });
    const teacherCourses = await ctx.db.query.courses.findMany({
      where: and(eq(coursesSchema.teacherId, ctx.session.user.id)),
      with: {
        lessons: {
          with: {
            mission: true,
          },
        },
      },
    });

    const studdentMissions = studentSubscriptions.flatMap((subscription) => {
      return subscription.reviews.map((review) => review.mission);
    });
    const teacherMissions = teacherCourses.flatMap((course) => {
      return course.lessons.flatMap((lesson) => lesson.mission);
    });

    return {
      courses,
      lessons,
      missions: [...studdentMissions, ...teacherMissions],
    };
  }),
});
