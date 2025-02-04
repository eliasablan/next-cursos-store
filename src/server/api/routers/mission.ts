import { MissionSchema, type MissionSchemaType } from "@/schemas/mission";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  subscriptions,
  missions,
  lessons,
  reviews,
  courses,
  reviewDocuments,
} from "@/server/db/schema";
import { eq, and, lte, gte, desc } from "drizzle-orm";

export const missionRouter = createTRPCRouter({
  getMissionById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: missionId } = input;
      console.log({ missionId });
      const mission = await ctx.db.query.missions.findFirst({
        where: eq(missions.id, missionId),
        with: {
          reviews: {
            with: {
              attachments: {
                orderBy: [desc(reviewDocuments.solution)],
              },
              mission: {
                with: {
                  lesson: {
                    with: {
                      // lessonAssistances: true,
                      course: {
                        with: {
                          teacher: {
                            columns: {
                              id: true,
                              name: true,
                              // username: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              subscription: {
                with: {
                  student: {
                    columns: {
                      id: true,
                      name: true,
                      // username: true,
                      email: true,
                      phone: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          lesson: {
            with: {
              course: {
                with: {
                  subscriptions: true,
                },
              },
            },
          },
        },
      });

      if (!mission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Misión no encontrada",
        });
      }

      return mission;
    }),

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

  getStudentMissions: protectedProcedure.query(async ({ ctx }) => {
    const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
      where: eq(subscriptions.studentId, ctx.session.user.id),
      with: {
        course: {
          with: {
            teacher: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          with: {
            mission: {
              with: {
                lesson: true,
              },
            },
          },
        },
      },
    });

    const missions = studentSubscriptions.flatMap(({ course, reviews }) =>
      reviews.map((review) => {
        const now = new Date();
        const deadline = review.mission.deadline;
        const extension = review.extension;

        let status: "open" | "extended" | "closed" = "closed";
        if (!extension && deadline > now) {
          status = "open";
          // Marks the mission as extended if the review with the furthest
          // extension date is greater than the current
        } else if (extension && extension > now) {
          status = "extended";
        }

        return {
          id: review.mission.id,
          title: review.mission.title ?? "",
          instructions: review.mission.instructions,
          score: review.mission.score,
          deadline: review.mission.deadline,
          status,
          lesson: {
            id: review.mission.lesson.id,
            title: review.mission.lesson.title,
            courseId: review.mission.lesson.courseId!,
          },
          course: {
            id: course.id,
            name: course.name,
          },
          teacher: course.teacher,
          reviews: [
            {
              id: review.id,
              extension: review.extension,
              score: review.score,
            },
          ],
        };
      }),
    );

    return missions.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }),

  updateOrCreate: protectedProcedure
    .input(MissionSchema)
    // .output(
    //   z.object({
    //     event: z.enum(["CREATED", "UPDATED"]),
    //     title: z.string(),
    //     reviews: z.array(z.object({ id: z.string() })).optional(),
    //   }),
    // )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const existingMission = await ctx.db.query.missions.findFirst({
          where: eq(missions.id, input.id),
        });

        if (!existingMission) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Misión no encontrada",
          });
        }

        const updatingFields: Partial<MissionSchemaType> = {};
        if (input.title !== existingMission.title)
          updatingFields.title = input.title;
        if (input.instructions !== existingMission.instructions)
          updatingFields.instructions = input.instructions;
        if (input.deadline !== existingMission.deadline)
          updatingFields.deadline = input.deadline;
        if (input.deadline !== existingMission.deadline)
          updatingFields.deadline = input.deadline;
        if (input.score !== existingMission.score) {
          updatingFields.score = input.score;
        }

        const isEmpty = Object.values(updatingFields).every(
          (value) => value === undefined,
        );

        if (isEmpty) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se ha cambiado nada",
          });
        }

        const [mission] = await ctx.db
          .update(missions)
          .set(updatingFields)
          .where(eq(missions.id, input.id))
          .returning();

        return {
          event: "UPDATED",
          ...mission!,
        };
      }

      const [mission] = await ctx.db
        .insert(missions)
        .values({
          title: input.title,
          instructions: input.instructions,
          score: input.score,
          lessonId: input.lessonId,
          deadline: input.deadline!,
        })
        .returning();

      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          course: {
            with: {
              subscriptions: {
                where: and(
                  // eq(subscriptions.active, true),
                  eq(subscriptions.paid, true),
                ),
              },
            },
          },
        },
      });

      const reviewsCreated = await Promise.allSettled(
        !lesson?.course
          ? []
          : lesson.course.subscriptions.map(async (subscription) => {
              const response = await ctx.db
                .insert(reviews)
                .values({
                  missionId: mission!.id,
                  subscriptionId: subscription.id,
                })
                .returning();
              return response;
            }),
      );

      return {
        event: "CREATED",
        reviews: reviewsCreated,
        ...mission!,
      };
    }),

  getStudentPendingMissions: protectedProcedure.query(async ({ ctx }) => {
    const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
      where: eq(subscriptions.studentId, ctx.session.user.id),
      with: {
        course: true,
        reviews: {
          with: {
            attachments: true,
            mission: true,
          },
        },
      },
    });

    const studentReviews = studentSubscriptions
      .filter(
        // Filter started courses
        ({ course }) =>
          course.startDate <= new Date() && course.endDate >= new Date(),
      )
      .flatMap(({ reviews, course }) => {
        return (
          reviews
            .filter(
              ({ extension, mission: { deadline } }) =>
                (extension && extension > new Date()) ??
                (deadline && deadline > new Date()),
            )
            .map((review) => ({
              ...review,
              course,
            }))
            // Filter open and extended reviews
            .filter((review) => !!review)
        );
      });

    return studentReviews.sort((a, b) => {
      const firstDate = a.extension?.getTime() ?? a.mission.deadline.getTime();
      const secondDate = b.extension?.getTime() ?? b.mission.deadline.getTime();
      return firstDate - secondDate;
    });
  }),

  getTeacherPendingReviews: protectedProcedure.query(async ({ ctx }) => {
    const teacherInProgressCourses = await ctx.db.query.courses.findMany({
      where: and(
        eq(courses.ownerId, ctx.session.user.id),
        and(
          lte(courses.startDate, new Date()),
          gte(courses.endDate, new Date()),
        ),
      ),
      with: {
        subscriptions: {
          with: {
            student: {
              columns: {
                id: true,
                name: true,
              },
            },
            reviews: {
              where: ({ score }, { isNull }) => isNull(score),
              with: {
                mission: true,
              },
            },
          },
        },
      },
    });
    return teacherInProgressCourses;
  }),
});
