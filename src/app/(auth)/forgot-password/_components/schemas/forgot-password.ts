import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Correo inválido.").or(z.string()),
});

export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;
