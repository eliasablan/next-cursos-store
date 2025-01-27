import { z } from "zod";

export const MissionSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "El título de la misión debe tener al menos 1 caracter")
    .max(255, "El título de la misión debe tener menos de 255 caracteres"),
  instructions: z
    .string()
    .min(1, "Las instrucciones de la misión deben tener al menos 1 caracter"),
  lessonId: z.string(),
  score: z.coerce.number().int().gt(0, {
    message: "La puntuación máxima de la misión debe de ser mayor a cero",
  }),
  deadline: z
    .date()
    .optional()
    .refine((value) => value, {
      message: "Debe seleccionar una fecha de finalización",
    }),
});

export type MissionSchemaType = z.infer<typeof MissionSchema>;
