import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { courses, subscriptions, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type InferSelectModel } from "drizzle-orm";

export const subscriptionRouter = createTRPCRouter({
  getAllSubscriptions: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.subscriptions.findMany({
        offset: input.limit * --input.page,
        limit: input.limit,
        with: {
          student: true,
          course: {
            with: {
              teacher: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return response.map((subscription) => {
        return {
          subscriptionId: subscription.id,
          studentId: subscription.student.id,
          courseSlug: subscription.course.slug,
          courseName: subscription.course.name,
          courseStart: subscription.course.startDate,
          courseEnd: subscription.course.endDate,
          studentName: subscription.student.name,
          studentUsername: subscription.student.username,
          studentEmail: subscription.student.email,
          teacherName: subscription.course.teacher.name,
          teacherUsername: subscription.course.teacher.username,
          teacherEmail: subscription.course.teacher.email,
          active: subscription.active,
          paid: subscription.paid,
        };
      });
    }),

  updateSubscription: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean(),
        paid: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [subscription] = await ctx.db
        .update(subscriptions)
        .set({
          active: input.active,
          paid: input.paid,
        })
        .where(eq(subscriptions.id, input.id))
        .returning();

      return subscription!;
    }),

  // Creates a new subscription with the "active" and "paid" fields set to true
  // or updates an existing one changing the "paid" and "active"
  // fields in case any of them is set to
  createSubscription: protectedProcedure
    .input(z.object({ courseId: z.string(), studentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const student = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.studentId),
        columns: {
          id: true,
          name: true,
          username: true,
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estudiante no encontrado",
        });
      }

      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.id, input.courseId),
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado",
        });
      }

      const subscription = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, input.studentId),
        ),
      });

      if (subscription) {
        if (subscription.active ?? subscription.paid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `El estudiante ${student?.name ?? student?.username} ya está suscrito al curso ${course.name}`,
          });
        }

        const [result] = await ctx.db
          .update(subscriptions)
          .set({
            active: true,
            paid: true,
          })
          .where(eq(subscriptions.id, subscription.id))
          .returning();

        return { ...result!, student, course };
      } else {
        const [result] = await ctx.db
          .insert(subscriptions)
          .values({
            courseId: input.courseId,
            studentId: input.studentId,
            active: true,
            paid: true,
          })
          .returning();

        return { ...result!, student, course };
      }
    }),

  // Update the "paid" and "active" fields of a subscription
  // Returns the subscription student and course for a better
  // user experience when the displaying the mutations result message
  updateSubscriptionStatus: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        studentId: z.string(),
        active: z.boolean().optional(),
        paid: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, input.studentId),
        ),
        with: {
          course: true,
          student: {
            columns: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
              phone: true,
            },
          },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Suscripción no encontrada",
        });
      }

      const { course, student } = subscription;

      const updatingFields: Partial<InferSelectModel<typeof subscriptions>> =
        {};

      if (input.active !== undefined) updatingFields.active = input.active;
      if (input.paid !== undefined) updatingFields.paid = input.paid;

      const isEmpty = Object.values(updatingFields).every(
        (value) => value === undefined,
      );

      if (isEmpty) {
        return {
          ...subscription,
          student,
          course,
          event: "NOT_CHANGED",
        };
      }

      const [result] = await ctx.db
        .update(subscriptions)
        .set({
          active: input.active ?? subscription.active,
          paid: input.paid ?? subscription.paid,
        })
        .where(eq(subscriptions.id, subscription.id))
        .returning();

      return { ...result!, student, course, event: "UPDATED" };
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

  getStudentSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const response = await ctx.db.query.subscriptions.findMany({
      where: eq(subscriptions.studentId, ctx.session.user.id),
      with: {
        course: {
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [
                asc(lessons.newDate ?? lessons.startDate),
              ],
              with: {
                lessonAssistances: true,
              },
            },
          },
        },
      },
    });

    const studentSubscriptions = response.map((subscription) => {
      let status = "next";

      if (subscription.course.endDate < new Date()) {
        status = "finished";
      } else {
        if (subscription.course.startDate <= new Date()) {
          status = "started";
        }
      }

      const studentAssitances = subscription.course.lessons
        .flatMap(({ lessonAssistances }) => lessonAssistances)
        .filter(({ studentId }) => studentId === ctx.session.user.id);

      const studentAssistanceMappedLessons = subscription.course.lessons.map(
        (lesson) => {
          const studentAssistance = studentAssitances.filter(
            (assistance) => assistance.lessonId === lesson.id,
          );

          return { ...lesson, lessonAssistances: studentAssistance };
        },
      );

      return {
        ...subscription,
        course: {
          ...subscription.course,
          lessons: studentAssistanceMappedLessons,
          status,
        },
      };
    });

    return studentSubscriptions;
  }),

  isSubscribed: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, ctx.session.user.id),
        ),
      });

      return response;
    }),

  getSubscriptionByCourseId: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.courseId, input.courseId),
          eq(subscriptions.studentId, ctx.session.user.id),
        ),
        with: {
          reviews: {
            with: {
              mission: true,
            },
          },
        },
      });

      return response;
    }),
});
