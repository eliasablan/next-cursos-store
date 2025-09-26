import React from "react";
import { api } from "@/trpc/server";
import { es } from "date-fns/locale";
import { format } from "date-fns";
// import { School } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SubscribeCourseButton from "./SubscribeCourseButton";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { auth } from "@/server/auth";

export default async function CoursesGrid({
  courses,
  openSubscribtion,
}: {
  courses: Awaited<ReturnType<typeof api.course.getNextCourses>>;
  openSubscribtion?: boolean;
}) {
  const session = await auth();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map(async (course) => {
        const teacher = await api.user.getUserById({ id: course.ownerId });
        return (
          <Link key={course.id} href={`/cursos/${course.slug}`}>
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="z-10 flex w-full flex-col items-start justify-center gap-2">
                  <div>
                    <Label>Profesor</Label>
                    <p className="font-semibold text-accent">{teacher?.name}</p>
                  </div>
                  <div>
                    <Label>Fecha de inicio</Label>
                    <p className="font-semibold text-accent">
                      {format(new Date(course.startDate), "PPP", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div>
                    <Label>Fecha de finalización</Label>
                    <p className="font-semibold text-accent">
                      {format(new Date(course.endDate), "PPP", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
              {openSubscribtion &&
                session &&
                teacher?.id !== session.user.id && (
                  <CardFooter className="h-fit">
                    <div className="flex w-full justify-end">
                      <SubscribeCourseButton courseId={course.id} />
                    </div>
                  </CardFooter>
                )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export function CoursesGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <p className="text-white">Loading</p>
      {/* {Array(8)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            className="h-full w-full flex-col justify-between"
          />
        ))} */}
    </div>
  );
}
