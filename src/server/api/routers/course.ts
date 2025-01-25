import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { courses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { CourseSchema } from "@/schemas/course";

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

      const course = await ctx.db
        .insert(courses)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
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
});
