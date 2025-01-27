import { z } from "zod";

export const LessonSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().nullish(),
  title: z
    .string()
    .min(8, "El nombre de la lección debe tener al menos 8 caracteres")
    .max(35, "El nombre de la lección no puede tener más de 35 caracteres"),
  description: z
    .string()
    .min(10, "La descripción de la lección debe tener al menos 10 caracteres")
    .max(
      1024,
      "La descripción de la lección no puede tener más de 1024 caracteres",
    ),
  order: z.number(),
  startDate: z.date().nullable(),
  newDate: z.date().nullable(),
  video: z.string().nullish(),
});

export type LessonSchemaType = z.infer<typeof LessonSchema>;
