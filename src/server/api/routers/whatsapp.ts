import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { env } from "process";
import { z } from "zod";
import { users, lessons, reviews } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const whatsappRouter = createTRPCRouter({
  sendAssistanceMessageToParent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        lessonId: z.string(),
      }),
    )
    .output(z.object({ data: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { studentId, lessonId } = input;

      const student = await ctx.db.query.users.findFirst({
        where: eq(users.id, studentId),
        columns: {
          id: true,
          name: true,
          username: true,
          phone: true,
        },
      });

      if (!student) {
        throw new TRPCError({
          message: "Estudiante no encontrado",
          code: "NOT_FOUND",
        });
      }

      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
          course: true,
        },
      });

      if (!lesson?.course) {
        throw new TRPCError({
          message: "Lección no encontrada",
          code: "NOT_FOUND",
        });
      }

      const { name: studentName, username: studentUsername, phone } = student;

      if (!phone) {
        return { data: null };
      }

      const { course } = lesson;

      const body = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "estudiante_ausente",
          language: { code: "es" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "text",
                  text: studentName ?? studentUsername,
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `Padre de ${studentName ?? studentUsername}`,
                },
                {
                  type: "text",
                  text: studentName ?? studentUsername,
                },
                {
                  type: "text",
                  text: course?.name,
                },
                {
                  type: "text",
                  text: lesson.title,
                },
              ],
            },
          ],
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.WHATSAPP_PERMANENT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseData = await response.json();

      if (!response.ok) {
        throw new TRPCError({
          message: "Error al enviar mensaje",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

      return { data: JSON.stringify(responseData) };
    }),

  sendMissionScoreToParent: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .output(z.object({ data: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { reviewId } = input;

      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
        with: {
          mission: true,
          subscription: {
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
          },
        },
      });

      if (!review) {
        throw new TRPCError({
          message: "Revisión no encontrada",
          code: "NOT_FOUND",
        });
      }

      const {
        mission: { title: missionTitle, score: missionScore },
        score: reviewScore,
        teacherReview: feedback,
        subscription: {
          student: { name: studentName, username: studentUsername, phone },
        },
      } = review;

      if (!phone) {
        return { data: null };
      }

      const body = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "calificacion_estudiante",
          language: { code: "es" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `Padre de ${studentName ?? studentUsername}`,
                },
                {
                  type: "text",
                  text: studentName ?? studentUsername,
                },
                {
                  type: "text",
                  text: missionTitle,
                },
                {
                  type: "text",
                  text: `${reviewScore ?? 0}/${missionScore}`,
                },
                {
                  type: "text",
                  text: feedback
                    ? `*Comentarios del profesor*\\n${feedback.replace(/(?:\r\n|\r|\n)/g, "\\n")}`
                    : "Esperamos haber sido de ayuda, que tenga un buen día.",
                },
              ],
            },
          ],
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.WHATSAPP_PERMANENT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      console.log(response);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        const text = await response.text();
        console.log(text);

        throw new TRPCError({
          message: "Error al enviar mensaje",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return { data: JSON.stringify(responseData) };
    }),

  sendMissionFeedbackToParent: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .output(z.object({ data: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { reviewId } = input;

      const review = await ctx.db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
        with: {
          mission: true,
          subscription: {
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
          },
        },
      });

      if (!review) {
        throw new TRPCError({
          message: "Revisión no encontrada",
          code: "NOT_FOUND",
        });
      }

      const {
        teacherReview: feedback,
        mission: { title: missionTitle },
        subscription: {
          student: { name, username, phone },
        },
      } = review;

      if (!feedback) {
        return { data: null };
      }

      if (!phone) {
        return { data: null };
      }

      const body = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "feedback_mision",
          language: { code: "es" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: missionTitle,
                },
                {
                  type: "text",
                  text: name ?? username,
                },
                {
                  type: "text",
                  text: feedback.replace(/(?:\r\n|\r|\n)/g, "\\n"),
                },
              ],
            },
          ],
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.WHATSAPP_PERMANENT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const responseData = await response.json();

      if (!response.ok) {
        throw new TRPCError({
          message: "Error al enviar mensaje",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { data: JSON.stringify(responseData) };
    }),
});
