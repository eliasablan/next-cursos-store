import { eq, asc, or, gte, and, lte } from "drizzle-orm";
import { z } from "zod";
import { CourseSchema } from "../../../app/mis-cursos/_components/schemas/course";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { courses, lessons, subscriptions } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const courseRouter = createTRPCRouter({
  updateOrCreate: protectedProcedure
    .input(CourseSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const course = await ctx.db
          .update(courses)
          .set({
            name: input.name,
            slug: input.slug,
            description: input.description,
            startDate: new Date(input.startDate!),
            endDate: new Date(input.endDate!),
          })
          .where(eq(courses.id, input.id))
          .returning();
        return {
          event: "UPDATED",
          ...course[0],
        };
      }

      // Validacion de slug
      const existingCourse = await ctx.db.query.courses.findFirst({
        where: eq(courses.slug, input.slug),
      });
      if (existingCourse) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El slug ya está en uso",
        });
      }

      const course = await ctx.db
        .insert(courses)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          startDate: new Date(input.startDate!),
          endDate: new Date(input.endDate!),
          teacherId: ctx.session.user.id,
        })
        .returning();

      return {
        event: "CREATED",
        ...course[0],
      };
    }),

  getCourses: protectedProcedure.query(async ({ ctx }) => {
    const response = await ctx.db
      .select()
      .from(courses)
      .orderBy(courses.startDate);

    return response;
  }),

  getTeacherCourses: protectedProcedure
    .input(z.object({ teacherId: z.string() }))
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          status: z.string(),
          createdAt: z.date(),
          updatedAt: z.date().nullable(),
          description: z.string().nullable(),
          slug: z.string(),
          teacherId: z.string(),
          startDate: z.date(),
          endDate: z.date(),
          totalLessons: z.number(),
          pastLessons: z.number(),
          totalSubscriptions: z.number(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const coursesWithDetails = await ctx.db.query.courses.findMany({
        where: eq(courses.teacherId, input.teacherId),
        with: {
          lessons: true,
          subscriptions: true,
        },
      });

      return coursesWithDetails.map((course) => {
        let status = "next";
        if (course.endDate < now) {
          status = "finished";
        } else if (course.startDate <= now) {
          status = "started";
        }

        const totalLessons = course.lessons.length;
        const pastLessons = course.lessons.filter(
          (lesson) => lesson.startDate && lesson.startDate <= now,
        ).length;
        const totalSubscriptions = course.subscriptions.length;

        return {
          status,
          ...course,
          totalLessons,
          pastLessons,
          totalSubscriptions,
        };
      });
    }),

  getCourseBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.slug, input.slug),
        with: {
          lessons: {
            with: {
              mission: true,
            },
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado",
        });
      }

      return course;
    }),

  getCourseLessons: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.slug, input.slug),
        with: {
          lessons: {
            orderBy: asc(lessons.order),
            with: {
              lessonAssistances: true,
              mission: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado",
        });
      }

      const { lessons: courseLessons } = course;

      return courseLessons;
    }),

  getCourseSubscriptions: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.slug, input.slug),
        with: {
          teacher: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
          subscriptions: {
            with: {
              student: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado",
        });
      }

      return course;
    }),

  getStudentNextLessons: protectedProcedure.query(async ({ ctx }) => {
    const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
      where: eq(subscriptions.studentId, ctx.session.user.id),
      with: {
        course: {
          with: {
            lessons: {
              with: {
                lessonAssistances: {
                  where: ({ studentId }, { eq }) =>
                    eq(studentId, ctx.session.user.id),
                },
              },
            },
          },
        },
      },
    });

    const nextLessons = studentSubscriptions
      .filter(
        ({ course }) =>
          course.startDate <= new Date() && course.endDate >= new Date(),
      )
      .flatMap((subscription) => {
        const courseLessons = subscription.course.lessons
          .map((lesson) => ({
            ...lesson,
            course: subscription.course,
          }))
          .filter(
            ({ startDate, newDate }) =>
              (newDate && newDate >= new Date()) ??
              (startDate && startDate >= new Date()),
          );

        return courseLessons;
      })
      .sort((a, b) => {
        const aDate = a.newDate?.getTime() ?? a.startDate?.getTime() ?? a.order;
        const bDate = b.newDate?.getTime() ?? b.startDate?.getTime() ?? b.order;

        return aDate - bDate;
      });

    return nextLessons;
  }),

  getTeacherNextLessons: protectedProcedure.query(async ({ ctx }) => {
    const teacherCourses = await ctx.db.query.courses.findMany({
      where: and(
        eq(courses.teacherId, ctx.session.user.id),
        and(
          gte(courses.endDate, new Date()),
          lte(courses.startDate, new Date()),
        ),
      ),
      with: {
        lessons: {
          where: or(
            gte(lessons.newDate, new Date()),
            gte(lessons.startDate, new Date()),
          ),
          with: {
            mission: true,
          },
        },
      },
    });

    const nextLessons = teacherCourses
      .flatMap(({ lessons, ...course }) =>
        lessons.map((lesson) => ({ ...lesson, course })),
      )
      .sort((a, b) => {
        const aDate = a.newDate?.getTime() ?? a.startDate?.getTime() ?? a.order;
        const bDate = b.newDate?.getTime() ?? b.startDate?.getTime() ?? b.order;

        return aDate - bDate;
      });

    return nextLessons;
  }),
});
