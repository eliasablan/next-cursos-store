"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  UpdateUserSchema,
  type UpdateUserSchemaType,
} from "./schemas/update-user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ProfilePictureMenu } from "./ProfilePictureMenu";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";

export default function UpdateUserForm() {
  const { data: session, update: updateSession } = useSession();

  const form = useForm<UpdateUserSchemaType>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: session?.user.name ?? undefined,
      phone: session?.user.phone ?? undefined,
      email: session?.user.email ?? undefined,
    },
  });

  const { mutateAsync: updateUser, isPending } =
    api.user.updateUser.useMutation({
      onSuccess: async () => {
        toast.success("Perfil actualizado correctamente");
        await updateSession();
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    });

  async function onSubmit(values: UpdateUserSchemaType) {
    await updateUser({ ...values });
  }

  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle>Actualiza tu perfil</CardTitle>
        <CardDescription>
          Cambia la manera en la que te identificas en el sitio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 pb-4">
          <Label>Foto de perfil</Label>
          <div className={"w-max"}>
            <ProfilePictureMenu />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="phone">Teléfono</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="me@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button disabled={isPending} className="w-full sm:w-max">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
