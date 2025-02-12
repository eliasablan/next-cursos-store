import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { courses, lessons } from "@/server/db/schema";
import { and, eq, gte, lt, lte, asc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { CourseSchema } from "@/schemas/course";
import stripe from "@/server/stripe";

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
            ownerId: ctx.session.user.id,
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

      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description,
        default_price_data: {
          currency: "usd",
          unit_amount: input.price * 100,
        },
        metadata: {
          owner: ctx.session.user.name!,
          email: ctx.session.user.email,
        },
      });

      const course = await ctx.db
        .insert(courses)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          stripePrice: input.price,
          stripeProductId: stripeProduct.id,
          stripePriceId: stripeProduct.default_price as string,
          startDate: new Date(input.startDate!),
          endDate: new Date(input.endDate!),
          ownerId: ctx.session.user.id,
        })
        .returning();

      return {
        event: "CREATED",
        ...course[0],
      };
    }),

  getPublishedCourses: protectedProcedure
    .input(z.object({ ownerId: z.string() }))
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          slug: z.string(),
          description: z.string().nullable(),
          startDate: z.date(),
          endDate: z.date(),
          status: z.string(),
          createdAt: z.date(),
          updatedAt: z.date().nullable(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const coursesWithDetails = await ctx.db.query.courses.findMany({
        where: eq(courses.ownerId, input.ownerId),
      });

      return coursesWithDetails.map((course) => {
        let status = "next";
        if (course.endDate < now) {
          status = "finished";
        } else if (course.startDate <= now) {
          status = "started";
        }

        return {
          status,
          ...course,
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

  getFinishedCourses: publicProcedure.query(async ({ ctx }) => {
    const queriedCourses = ctx.db.query.courses.findMany({
      where: and(
        lt(courses.startDate, new Date()),
        lte(courses.endDate, new Date()),
      ),
      orderBy: (courses, { desc }) => [desc(courses.endDate)],
    });

    return queriedCourses;
  }),

  getStartedCourses: publicProcedure.query(async ({ ctx }) => {
    const queriedCourses = ctx.db.query.courses.findMany({
      where: and(
        lt(courses.startDate, new Date()),
        gte(courses.endDate, new Date()),
      ),
      orderBy: (courses, { asc }) => [asc(courses.startDate)],
    });

    return queriedCourses;
  }),

  getNextCourses: publicProcedure.query(async ({ ctx }) => {
    const queriedCourses = ctx.db.query.courses.findMany({
      where: gte(courses.startDate, new Date()),
      orderBy: (courses, { asc }) => [asc(courses.startDate)],
    });

    return queriedCourses;
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
              // lessonAssistances: true,
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

  getTeacherNextLessons: protectedProcedure.query(async ({ ctx }) => {
    const teacherCourses = await ctx.db.query.courses.findMany({
      where: and(
        eq(courses.ownerId, ctx.session.user.id),
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

    return teacherCourses;
  }),
});
