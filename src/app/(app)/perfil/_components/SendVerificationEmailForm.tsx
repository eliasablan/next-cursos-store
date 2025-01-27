"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  SendVerificationEmailSchema,
  type SendVerificationEmailSchemaType,
} from "./schemas/send-verification-email";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function SendVerificationEmailForm() {
  const { data: session } = useSession();

  const { mutate: sendVerificationEmail, isPending } =
    api.user.sendVerificationEmail.useMutation({
      onSuccess() {
        toast.success("Revisa tu correo para activar tu cuenta.");
      },
      onError(error) {
        console.error(error);
        toast.error(
          error.message ||
            "Error al enviar correo. Intenta iniciar sesión para enviar el correo de nuevo.",
        );
      },
    });

  const form = useForm<SendVerificationEmailSchemaType>({
    resolver: zodResolver(SendVerificationEmailSchema),
    defaultValues: {
      email: session?.user.email ?? "",
    },
  });

  function onSubmit(values: SendVerificationEmailSchemaType) {
    sendVerificationEmail({ emailOrUsername: values.email });
  }

  if (session?.user.emailVerified) return null;

  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle>Verifica tu correo</CardTitle>
        <CardDescription>
          Envia un mensaje al correo con el que te registraste para verificar tu
          cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          disabled
                          {...{ ...field, value: session?.user.email ?? "" }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button disabled={isPending} className="w-full sm:w-max">
                {isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
