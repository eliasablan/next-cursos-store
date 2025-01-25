import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Book, Briefcase, CalendarIcon, Plus } from "lucide-react";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mis cursos",
};

const STATUS = [
  { key: "finished", label: "Finalizados" },
  { key: "started", label: "En progreso" },
  { key: "next", label: "Próximos" },
];

export default async function page() {
  const session = await auth();
  const courses = await api.course.getPublishedCourses({
    ownerId: session?.user.id ?? "",
  });

  return (
    <main className="grid w-full pb-4">
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <h1 className="block space-x-2 text-2xl font-semibold">
          <Briefcase className="mb-1 mr-2 inline size-6" />
          Cursos publicados
        </h1>
        <Button size="sm" asChild>
          <Link href="/crear-curso">
            <span>Crear curso</span>
            <Plus className="ml-2 size-4" />
            <span className="sr-only">Add</span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="started">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="started">En progreso</TabsTrigger>
            <TabsTrigger value="next">Próximos</TabsTrigger>
          </TabsList>
        </div>
        {STATUS.map(({ key }) => (
          <CoursesTab
            key={key}
            courses={courses.filter((course) => course.status === key)}
            status={key}
          />
        ))}
      </Tabs>
    </main>
  );
}

function CoursesTab({
  courses,
  status,
}: {
  courses: Awaited<ReturnType<typeof api.course.getPublishedCourses>>;
  status: (typeof STATUS)[number]["key"];
}) {
  return (
    <TabsContent value={status}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="flex h-full flex-col justify-between transition-all hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {course.name}
                </CardTitle>
                {/* <Badge variant="secondary">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {course.totalSubscriptions}
                  </Badge> */}
              </div>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* <div className="flex items-center justify-between text-sm">
                    <span>Progreso del curso</span>
                    <span className="font-medium">
                      {Math.round(
                        isNaN(course.pastLessons / course.totalLessons)
                          ? 100
                          : (course.pastLessons / course.totalLessons) * 100,
                      )}
                      %
                    </span>
                  </div> */}
                {/* <Progress
                    value={(course.pastLessons / course.totalLessons) * 100}
                    className="h-2 w-full"
                  /> */}
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Inicio:{" "}
                      {new Date(course.startDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span>
                      Fin:{" "}
                      {new Date(course.endDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mx-auto w-full border-t pt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link
                  key={course.id}
                  href={`/cursos-publicados/${course.slug}`}
                >
                  <Book className="mr-2 h-4 w-4" />
                  Ver detalles del curso
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}
