import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(3, "Tu nombre debe tener al menos 3 caracteres.")
    .optional(),
  username: z
    .string()
    .min(3, "Tu nombre de usuario debe tener al menos 3 caracteres.")
    .optional(),
  email: z.string().email("Correo inválido.").optional(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  image: z.string().optional(),
});

export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
