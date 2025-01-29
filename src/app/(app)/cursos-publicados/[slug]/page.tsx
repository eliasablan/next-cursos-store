import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api, HydrateClient } from "@/trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { auth } from "@/server/auth";
import LessonsCard from "../_components/LessonsCard";
import GoBackButton from "@/components/GoBackButton";

export default async function Curso({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const course = await api.course.getCourseBySlug({
    slug,
  });

  if (!course) {
    return (
      <div className="my-24 flex w-full flex-col items-center justify-center gap-8 font-mono">
        <h2 className="text-9xl font-bold text-destructive">404</h2>
        <h1 className="text-3xl font-semibold">Este curso no existe</h1>
      </div>
    );
  }

  if (session?.user.id !== course.ownerId) {
    return (
      <div className="my-24 flex w-full flex-col items-center justify-center gap-8 font-mono">
        <h2 className="text-9xl font-bold text-destructive">401</h2>
        <h1 className="text-3xl font-semibold">No tienes acceso a esta ruta</h1>
      </div>
    );
  }

  void (await api.course.getCourseLessons.prefetch({
    slug,
  }));

  return (
    <main className="grid w-full flex-1 auto-rows-max gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* BOTON ATRAS */}
        <GoBackButton />
        {/* TITULO */}
        <p className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {course.name}
        </p>
        {/* BOTON EDITAR */}
        {session?.user.id === course.ownerId && (
          <Link
            href={`/cursos-publicados/${slug}/editar`}
            className={cn("ml-auto", buttonVariants({ size: "sm" }))}
          >
            Editar curso
          </Link>
        )}
      </div>
      {/* Body */}
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          {/* DETALLES */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>Nombre del curso</Label>
                  <Input disabled value={course.name ?? ""} />
                </div>
                <div className="grid gap-3">
                  <Label>Slug</Label>
                  <Input disabled value={course.slug ?? ""} />
                </div>
                <div className="grid gap-3">
                  <Label>Descripción</Label>
                  <Textarea
                    value={course.description ?? ""}
                    disabled
                    className="h-96"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* LECCIONES */}
          <HydrateClient>
            <LessonsCard />
          </HydrateClient>
        </div>
        <div className="grid auto-rows-max items-start gap-4">
          {/* FECHAS DEL CURSO */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-3 sm:col-span-2">
                  <Label>Fecha de inicio</Label>
                  <Input
                    disabled
                    value={
                      course.startDate &&
                      format(course.startDate, "PP 'a las' h:mm a", {
                        locale: es,
                      })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:col-span-2">
                  <Label>Fecha de finalización</Label>
                  <Input
                    disabled
                    value={
                      course.endDate &&
                      format(course.endDate, "PP 'a las' h:mm a", {
                        locale: es,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* FECHAS DE EDICIÓN */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {course.createdAt && (
                  <div className="grid gap-3 sm:col-span-2">
                    <Label>Fecha de creación</Label>
                    <Input
                      disabled
                      value={format(course.createdAt, "PP 'a las' h:mm a", {
                        locale: es,
                      })}
                    />
                  </div>
                )}
                {course.updatedAt && (
                  <div className="grid gap-3 sm:col-span-2">
                    <Label>Fecha de última edición</Label>
                    <Input
                      disabled
                      value={format(course.updatedAt, "PP 'a las' h:mm a", {
                        locale: es,
                      })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
