import { z } from "zod";

export const SendVerificationEmailSchema = z.object({
  email: z.string().email("Correo inválido."),
});

export type SendVerificationEmailSchemaType = z.infer<
  typeof SendVerificationEmailSchema
>;
