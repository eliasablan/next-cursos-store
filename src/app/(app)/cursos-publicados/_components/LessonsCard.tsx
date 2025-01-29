"use client";

// #region imports
import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type api as serverApi } from "@/trpc/server";
import { TeacherLessons } from "./TeacherLessons";
// import { TeacherLessons } from "./TeacherLessons";

type Lesson = Awaited<
  ReturnType<typeof serverApi.course.getCourseLessons>
>[number];

export default function LessonsCard() {
  const utils = api.useUtils();

  const { slug: courseSlug } = useParams<{ slug: string }>();

  const [course] = api.course.getCourseBySlug.useSuspenseQuery({
    slug: courseSlug,
  });

  const [lessons] = api.course.getCourseLessons.useSuspenseQuery({
    slug: courseSlug,
  });

  const { mutateAsync: submitLesson } = api.lesson.updateOrCreate.useMutation({
    onMutate: async (newLesson) => {
      // Cancel any outgoing refetches
      // so they don't overwrite optimistic updates
      await utils.course.getCourseLessons.cancel({ slug: courseSlug });

      // Snapshot the previous lessons
      const previousLessons = utils.course.getCourseLessons.getData({
        slug: courseSlug,
      });

      utils.course.getCourseLessons.setData({ slug: courseSlug }, (old) => {
        return old ? old.concat(newLesson as Lesson) : [newLesson as Lesson];
      });
      // Return a context with the previous lessons
      return { previousLessons };
    },
    onError: (e, _newLesson, context) => {
      // If mutation fails, remove the submitted lesson from the cache
      // using the context returned above
      utils.course.getCourseLessons.setData(
        { slug: courseSlug },
        () => context?.previousLessons,
      );
      toast.error(e.message);
    },
    onSuccess: ({ event, title }) => {
      if (event === "CREATED") {
        toast.success(`Lección: "${title}" creada exitosamente`);
      } else if (event === "UPDATED") {
        toast.success(`Lección: "${title}" modificada exitosamente`);
      }
    },
    onSettled: async (data, error) => {
      if (error || !data) return;

      await utils.course.getCourseLessons.invalidate({
        slug: courseSlug,
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex w-full flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <CardTitle>Lecciones</CardTitle>
          <CardDescription>
            {Array.isArray(lessons)
              ? lessons.length +
                " lecciones. El orden lo puedes cambiar con las flechas a la izquierda de cada curso."
              : "Agrega lecciones a tu curso"}
          </CardDescription>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={async () => {
                await submitLesson({
                  id: undefined,
                  title: `Lección #${Array.isArray(lessons) ? lessons.length : 0}`,
                  description: `Descripción de la lección #${Array.isArray(lessons) ? lessons.length : 0}`,
                  startDate: null,
                  newDate: null,
                  video: null,
                  courseId: course.id,
                  order: Array.isArray(lessons) ? lessons.length : 0,
                });
              }}
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Crear nueva lección</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <TeacherLessons />
      </CardContent>
    </Card>
  );
}
