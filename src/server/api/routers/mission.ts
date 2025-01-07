import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  missions,
  reviews,
  subscriptions,
  courses,
  lessons,
  reviewDocuments,
} from "../../db/schema";
import { eq, and, desc, lte, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  MissionSchema,
  type MissionSchemaType,
} from "~/app/mis-cursos/_components/schemas/mission";

// Definimos un tipo común para ambos procedimientos
type ExtendedMission = {
  id: string;
  title: string;
  instructions: string | null;
  score: number;
  deadline: Date;
  status: "open" | "extended" | "closed";
  lesson: {
    id: string;
    title: string;
    courseId: string;
  };
  course: {
    id: string;
    name: string | null;
    teacherId: string;
  };
  teacher: {
    id: string;
    name: string | null;
    username: string;
  };
  reviews: {
    id: string;
    extension: Date | null;
    score: number | null;
  }[];
};

export const missionRouter = createTRPCRouter({
  getMissionById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: missionId } = input;
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
                      lessonAssistances: true,
                      course: {
                        with: {
                          teacher: {
                            columns: {
                              id: true,
                              name: true,
                              username: true,
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
                      username: true,
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

  getMissionByLessonId: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { lessonId } = input;

      const mission = await ctx.db.query.missions.findFirst({
        where: eq(missions.lessonId, lessonId),
      });

      if (!mission) {
        return null;
      }

      return mission;
    }),

  getReviewByMissionId: publicProcedure
    .input(
      z.object({
        missionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { missionId } = input;

      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.missionId, missionId),
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Revisión de la misión no encontrado",
        });
      }

      return review;
    }),

  updateReviewDeadline: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        extension: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { reviewId, extension } = input;
      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rendimiento de la misión no encontrado",
        });
      }

      const [updatedReview] = await ctx.db
        .update(reviews)
        .set({ extension })
        .where(eq(reviews.id, reviewId))
        .returning();

      return updatedReview;
    }),

  getReviewById: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { reviewId } = input;

      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No se ha encontrado la revisión",
        });
      }

      return review;
    }),

  getTeachersMissions: protectedProcedure.query(
    async ({ ctx }): Promise<ExtendedMission[]> => {
      const teacherCourses = await ctx.db.query.courses.findMany({
        where: eq(courses.teacherId, ctx.session.user.id),
        with: {
          lessons: {
            with: {
              mission: {
                with: {
                  reviews: true,
                },
              },
            },
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
          teacher: {
            columns: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      const missions = teacherCourses.flatMap((course) =>
        course.lessons
          .filter((lesson) => lesson.mission)
          .map((lesson): ExtendedMission => {
            const now = new Date();
            const deadline = lesson.mission!.deadline;

            const extendedReviews = lesson.mission?.reviews.filter(
              (review) => !!review.extension,
            );

            // Gets the review with the farthest extension date
            const farthestExtendedReview = !!extendedReviews?.length
              ? extendedReviews.reduce((acc, curr) =>
                  acc.extension! > curr.extension! ? acc : curr,
                )
              : null;

            const farthestExtension = farthestExtendedReview?.extension;

            let status: "open" | "extended" | "closed" = "closed";
            if (!farthestExtension && deadline > now) {
              status = "open";
            } else if (farthestExtension && farthestExtension > now) {
              status = "extended";
            }

            return {
              id: lesson.mission!.id,
              title: lesson.mission!.title ?? "",
              instructions: lesson.mission!.instructions,
              score: lesson.mission!.score,
              deadline: lesson.mission!.deadline,
              status,
              lesson: {
                id: lesson.id,
                title: lesson.title,
                courseId: course.id,
              },
              course: {
                id: course.id,
                name: course.name,
                teacherId: course.teacherId,
              },
              teacher: course.teacher,
              reviews: lesson.mission!.reviews.map((review) => ({
                id: review.id,
                extension: review.extension,
                score: review.score,
              })),
            };
          }),
      );

      return missions.sort(
        (a, b) => a.deadline.getTime() - b.deadline.getTime(),
      );
    },
  ),

  getStudentMissions: protectedProcedure.query(
    async ({ ctx }): Promise<ExtendedMission[]> => {
      const studentSubscriptions = await ctx.db.query.subscriptions.findMany({
        where: eq(subscriptions.studentId, ctx.session.user.id),
        with: {
          course: {
            with: {
              teacher: {
                columns: {
                  id: true,
                  name: true,
                  username: true,
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
        reviews.map((review): ExtendedMission => {
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
              teacherId: course.teacherId,
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

      return missions.sort(
        (a, b) => a.deadline.getTime() - b.deadline.getTime(),
      );
    },
  ),

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
        eq(courses.teacherId, ctx.session.user.id),
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
                username: true,
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

    const reviews = teacherInProgressCourses
      .flatMap(({ subscriptions, ...course }) => {
        const studentReviews = subscriptions.flatMap(({ reviews, student }) =>
          reviews.map((review) => ({ ...review, student, course })),
        );
        return studentReviews;
      })
      .filter((review) => !!review)
      .sort((a, b) => {
        const aDate = a.extension?.getTime() ?? a.mission.deadline.getTime();
        const bDate = b.extension?.getTime() ?? b.mission.deadline.getTime();

        return aDate - bDate;
      });

    return reviews;
  }),

  getStudentReviews: protectedProcedure.query(async ({ ctx }) => {
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

    const reviews = studentSubscriptions
      ?.flatMap((studentSubscription) => {
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
      })
      .sort((a, b) => {
        const aDate = a.extension?.getTime() ?? a.mission.deadline.getTime();
        const bDate = b.extension?.getTime() ?? b.mission.deadline.getTime();

        return aDate - bDate;
      });

    return reviews;
  }),
});
