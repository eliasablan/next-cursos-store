import { z } from "zod";
import { LessonSchema } from "./lesson";

export const CourseSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(8, "El nombre del curso debe tener al menos 8 caracteres")
    .max(50, "El nombre del curso no puede tener más de 50 caracteres"),
  slug: z
    .string()
    .min(5, "El slug debe tener al menos 5 caracteres")
    .max(35, "El slug no puede tener más de 35 caracteres")
    .refine(
      (value) => {
        const isSlug = new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$");
        return isSlug.test(value);
      },
      {
        message:
          "Para slugs, utiliza solo letras minúsculas, números y guiones (-).",
      },
    ),
  description: z
    .string()
    .min(10, "La descripción del curso debe tener al menos 10 caracteres")
    .max(
      1024,
      "La descripción del curso no puede tener más de 1024 caracteres",
    ),
  price: z.number(),
  startDate: z
    .date()
    .optional()
    .refine((value) => value, {
      message: "Debe seleccionar una fecha de inicio",
    }),
  endDate: z
    .date()
    .optional()
    .refine((value) => value, {
      message: "Debe seleccionar una fecha de finalización",
    }),
  lessons: z.array(LessonSchema),
});

export type CourseSchemaType = z.infer<typeof CourseSchema>;
