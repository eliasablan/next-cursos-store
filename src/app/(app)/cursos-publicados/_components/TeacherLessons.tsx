"use client";

import React from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { changeLessonOrder, cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { type api as serverApi } from "@/trpc/server";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Grip, Sword, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonAssistances } from "./LessonAssistances";
import { LessonForm } from "./LessonForm";
import MissionForm from "./MissionForm";

// Definición del tipo Lesson basado en el resultado de la API del servidor
type Lesson = Awaited<
  ReturnType<typeof serverApi.course.getCourseLessons>
>[number];

// Componente LessonItem: Representa un elemento de lección individual
const LessonItem = ({ lesson }: { lesson: Lesson }) => {
  // Configuración de dnd-kit para hacer el elemento arrastrable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: lesson.id,
      strategy: verticalListSortingStrategy,
      transition: null,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determina si la lección es pasada basándose en las fechas
  const isPastLesson =
    (lesson.newDate && lesson.newDate < new Date()) ??
    (lesson.startDate && lesson.startDate < new Date());

  return (
    <AccordionItem
      ref={setNodeRef}
      className="bg-card"
      style={{ ...style }}
      value={`item-${lesson.id}`}
    >
      <div className="flex w-full items-center justify-between">
        <div {...attributes} {...listeners}>
          <Grip className={cn("h-5 w-5 cursor-grab")} />
        </div>
        <AccordionTrigger className="gap-4">
          {lesson.title || "Nueva lección"}
        </AccordionTrigger>
      </div>
      <AccordionContent>
        <div className="flex w-full items-center justify-end gap-4 p-4">
          {/* Asistencias si la lección es pasada */}
          {isPastLesson && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 size-4" /> Asistencias
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Asistencias</DialogTitle>
                  <DialogDescription>
                    Marca la asistencia de los estudiantes a la clase.
                  </DialogDescription>
                </DialogHeader>
                <LessonAssistances lessonId={lesson.id} />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant={"secondary"}>
                      Cerrar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {/* Misión */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sword className="mr-2 size-4" />
                {lesson.mission ? "Editar misión" : "Crear misión"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar/Editar misión</DialogTitle>
                <DialogDescription>
                  Agrega o edita la misión correspondiente a la lección.
                </DialogDescription>
              </DialogHeader>
              <MissionForm lessonId={lesson.id} mission={lesson.mission} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant={"secondary"}>
                    Cerrar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Enlace a la mision */}
        {lesson.mission && (
          <p className="px-4 text-right text-sm">
            {"Misión: "}
            <Link
              href={`/misiones/${lesson.mission.id}/`}
              className="text-primary hover:underline"
            >
              {lesson.mission.title}
            </Link>
          </p>
        )}
        <LessonForm lesson={lesson} />
      </AccordionContent>
    </AccordionItem>
  );
};

// Componente principal TeacherLessons
export const TeacherLessons = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const { slug: courseSlug } = useParams<{ slug: string }>();

  // Consulta las lecciones del curso usando TRPC
  const { data: lessons } = api.course.getCourseLessons.useQuery({
    slug: courseSlug,
  });

  const utils = api.useUtils();

  // Configuración de la mutación para actualizar el orden de las lecciones
  const { mutateAsync: updateLessonOrder } =
    api.lesson.updateLessonOrder.useMutation({
      onSuccess: () => {
        toast.success("Orden de la lección actualizado.");
      },
      onMutate: async ({ from, to }) => {
        // Lógica de actualización optimista
        await utils.course.getCourseLessons.cancel({ slug: courseSlug });
        const previousLessons = utils.course.getCourseLessons.getData({
          slug: courseSlug,
        });
        utils.course.getCourseLessons.setData({ slug: courseSlug }, (old) => {
          return changeLessonOrder({ lessons: old, from, to })?.sort(
            (a, b) => a.order - b.order,
          );
        });
        return { previousLessons };
      },
      onError: (e, _variables, context) => {
        // Revertir cambios en caso de error
        utils.course.getCourseLessons.setData(
          { slug: courseSlug },
          () => context?.previousLessons,
        );
        toast.error(e.message);
      },
      onSettled: async (_data, error) => {
        if (error) return;
        await utils.course.getCourseLessons.invalidate({
          slug: courseSlug,
        });
      },
    });

  // Configuración de los sensores para dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Maneja el final del arrastre para actualizar el orden de las lecciones
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (!lessons) return;
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);
      const [lesson] = lessons.filter((lesson) => lesson.id === active.id);

      if (lesson) {
        await updateLessonOrder({
          lessonId: lesson.id,
          from: oldIndex,
          to: newIndex,
        });
      }
    }
  };
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <Accordion type="single" collapsible>
      {lessons && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map((lesson, idx) => (
              <LessonItem key={idx} lesson={lesson} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Accordion>
  );
};
