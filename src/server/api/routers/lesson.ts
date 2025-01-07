import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { LessonSchema } from "../../../app/mis-cursos/_components/schemas/lesson";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { lessonsAssistances, lessons } from "@/server/db/schema";

export const lessonRouter = createTRPCRouter({
  getLessonById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
      });

      return lesson;
    }),

  removeLesson: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedLesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
        with: {
          course: {
            with: {
              lessons: {
                orderBy: asc(lessons.order),
              },
            },
          },
        },
      });

      if (deletedLesson?.course) {
        const {
          course: { lessons: courseLessons },
        } = deletedLesson;

        const toUpdateLessons = courseLessons.slice(deletedLesson.order + 1);

        const [result] = await ctx.db
          .delete(lessons)
          .where(eq(lessons.id, input.id));

        // Updates courses lessons orders after deleting the specified lesson
        const newLessonsPromisses = toUpdateLessons.map(
          (lesson, lessonIndex) => {
            return ctx.db
              .update(lessons)
              .set({ order: lessonIndex })
              .where(eq(lessons.id, lesson.id));
          },
        );

        await Promise.all(newLessonsPromisses);

        return result;
      }
    }),

  updateOrCreate: protectedProcedure
    .input(LessonSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const lesson = await ctx.db.query.lessons.findFirst({
          where: eq(lessons.id, input.id),
        });

        if (!lesson) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Lección no encontrada",
          });
        }

        const updatingFields: Partial<z.infer<typeof LessonSchema>> = {};
        if (input.title !== lesson.title) updatingFields.title = input.title;
        if (input.description !== lesson.description)
          updatingFields.description = input.description;
        if (
          !!input.startDate &&
          JSON.stringify(input.startDate) !== JSON.stringify(lesson.startDate)
        )
          updatingFields.startDate = new Date(input.startDate);
        if (
          input.newDate &&
          JSON.stringify(input.newDate) !== JSON.stringify(lesson.newDate)
        )
          updatingFields.newDate = new Date(input.newDate);
        // if (input.order && input.order !== lesson.order)
        //   updatingFields.order = input.order;
        if (input.video !== lesson.video) updatingFields.video = input.video;

        const isEmpty = Object.values(updatingFields).every(
          (value) => value === undefined,
        );

        if (isEmpty) {
          return {
            event: "NOT_CHANGED",
            ...lesson,
          };
        }

        const updatedLesson = await ctx.db
          .update(lessons)
          .set(updatingFields)
          .where(eq(lessons.id, input.id))
          .returning();

        return {
          event: "UPDATED",
          ...updatedLesson[0],
        };
      }

      const [lesson] = await ctx.db
        .insert(lessons)
        .values({
          title: input.title,
          description: input.description,
          startDate: input.startDate,
          courseId: input.courseId,
          order: input.order,
          video: input.video,
        })
        .returning();

      return {
        event: "CREATED",
        ...lesson!,
      };
    }),

  updateLessonOrder: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        from: z.number(),
        to: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { lessonId, to } = input;

      const movedLesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
      });

      if (!movedLesson) {
        throw new TRPCError({
          message: "Lección no encontrada",
          code: "NOT_FOUND",
        });
      }

      // const replacedLesson = await ctx.db.query.lessons.findFirst({
      //   where: eq(lessons.order, to),
      // });

      // if (!replacedLesson) {
      //   throw new TRPCError({
      //     message: `Lección de orden ${to} no encontrada`,
      //     code: "NOT_FOUND",
      //   });
      // }

      const [replacedLessonResult] = await ctx.db
        .update(lessons)
        .set({ order: from })
        .where(eq(lessons.order, to))
        .returning();

      const [movedLessonResult] = await ctx.db
        .update(lessons)
        .set({ order: to })
        .where(eq(lessons.id, lessonId))
        .returning();

      return { movedLessonResult, replacedLessonResult };
    }),

  getLessonsAssistances: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          course: {
            with: {
              subscriptions: {
                with: {
                  student: {
                    columns: {
                      id: true,
                      name: true,
                      username: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          lessonAssistances: {
            with: {
              student: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lección no encontrada",
        });
      }

      const { course, lessonAssistances } = lesson;

      const courseStudents = course!.subscriptions.map(({ student }) => {
        const assistance = lessonAssistances.find(
          ({ student: assistantStudent }) => {
            return assistantStudent.id === student.id;
          },
        );

        return {
          ...student,
          assisted:
            typeof assistance === "undefined" ? null : assistance.assisted,
        };
      });

      return courseStudents;
    }),

  updateLessonAssistance: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        studentId: z.string(),
        assisted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          course: true,
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lección no encontrada",
        });
      }

      const lessonAssistance = await ctx.db.query.lessonsAssistances.findFirst({
        where: and(
          eq(lessonsAssistances.lessonId, input.lessonId),
          eq(lessonsAssistances.studentId, input.studentId),
        ),
        with: {
          student: {
            columns: {
              id: true,
              name: true,
              username: true,
              phone: true,
            },
          },
        },
      });

      if (!lessonAssistance) {
        const [result] = await ctx.db
          .insert(lessonsAssistances)
          .values({
            lessonId: input.lessonId,
            studentId: input.studentId,
            assisted: input.assisted ?? true,
          })
          .returning();

        return result;
      } else {
        const [result] = await ctx.db
          .update(lessonsAssistances)
          .set({ assisted: input.assisted ?? !lessonAssistance.assisted })
          .where(eq(lessonsAssistances.id, lessonAssistance.id))
          .returning();

        return result;
      }
    }),

  getLessonMission: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          mission: true,
        },
      });

      if (!lesson) {
        throw new TRPCError({
          message: "Lección no encontrada",
          code: "NOT_FOUND",
        });
      }

      if (!lesson.mission) {
        return null;
      }

      return lesson.mission;
    }),
});
