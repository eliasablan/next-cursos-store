import React from "react";
import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CoursesGrid from "./_components/CoursesCatalog";
import { LibraryBig } from "lucide-react";

export const metadata: Metadata = {
  title: "Cursos",
};

export default async function page() {
  const nextCourses = await api.course.getNextCourses();
  const finishedCourses = await api.course.getFinishedCourses();
  const startedCourses = await api.course.getStartedCourses();

  return (
    <main className="grid w-full">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <LibraryBig className="size-6" />
        Catálogo de cursos
      </h1>
      <Tabs defaultValue="next">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="started">En progreso</TabsTrigger>
            <TabsTrigger value="next">Próximos</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="finished">
          <CoursesGrid courses={finishedCourses} />
        </TabsContent>
        <TabsContent value="started">
          <CoursesGrid courses={startedCourses} />
        </TabsContent>
        <TabsContent value="next">
          <CoursesGrid courses={nextCourses} openSubscribtion={true} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
