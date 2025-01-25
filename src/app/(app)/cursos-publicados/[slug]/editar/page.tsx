import React from "react";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import CourseForm from "@/app/(app)/crear-curso/_components/CourseForm";

export default async function EditCourse({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();

  const course = await api.course.getCourseBySlug({
    slug: params.slug,
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

  return <CourseForm />;
}
