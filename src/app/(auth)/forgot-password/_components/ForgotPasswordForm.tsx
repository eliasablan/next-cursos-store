"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  ForgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "./schemas/forgot-password";

export default function ForgotPasswordForm() {
  const { data: session } = useSession();

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: session?.user.email ?? session?.user.email ?? "",
    },
  });

  const { mutate: sendResetPasswordEmail, isPending } =
    api.user.sendPasswordResetEmail.useMutation({
      onSuccess: () => {
        toast.success(
          "Se ha enviado un enlace a tu correo para cambiar tu contraseña",
        );
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    });

  // 2. Define a submit handler.
  function onSubmit(values: ForgotPasswordSchemaType) {
    sendResetPasswordEmail({
      email: session?.user.email ?? session?.user.email ?? values.email,
    });
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Cambio de contraseña</CardTitle>
        <CardDescription>
          Envía un correo verificación a tu correo asociado para cambiar tu
          contraseña.
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
                      <FormLabel>Correo o nombre de usuario</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={!!session}
                          placeholder={"tucorreo@ejemplo.com"}
                          {...{
                            ...field,
                            value: session?.user.email,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Enviando..." : "Enviar correo"}
              </Button>
            </div>
          </form>
        </Form>
        <Button variant={"link"} asChild className="w-full">
          {session ? (
            <Link href="/">Volver</Link>
          ) : (
            <Link href="/ingresar">Volver</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
