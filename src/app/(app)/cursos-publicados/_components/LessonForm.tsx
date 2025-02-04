"use client";

import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LessonSchema, type LessonSchemaType } from "@/schemas/lesson";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { es } from "date-fns/locale";
import { LessonVideoUploader } from "./LessonVideoUploader";

// Componente principal para el formulario de lección
export function LessonForm({ lesson }: { lesson: LessonSchemaType }) {
  // Obtener la sesión del usuario y el slug del curso
  const { slug: courseSlug } = useParams<{ slug: string }>();

  // Utilidades de TRPC para invalidar consultas
  const utils = api.useUtils();

  // Configuración del formulario con react-hook-form y zod para validación
  const form = useForm({
    resolver: zodResolver(LessonSchema),
    defaultValues: lesson,
  });

  // Mutación para enviar/actualizar la lección
  const { mutateAsync: submitLesson, isPending: submittingLesson } =
    api.lesson.updateOrCreate.useMutation({
      onSuccess: ({ event, title }) => {
        // Mostrar toast según el resultado de la operación
        if (event === "NOT_CHANGED") {
          toast.success("No se ha modificado la lección");
        } else if (event === "UPDATED") {
          toast.success(`Lección: "${title}" modificada exitosamente`);
        } else if (event === "CREATED") {
          toast.success(`Lección: "${title}" creada exitosamente`);
        }
      },
      onError: (e) => {
        toast.error(e.message);
      },
      onSettled: async (data, error) => {
        if (error ?? !data) return;

        // Invalidar consultas relacionadas después de la operación
        await utils.course.getCourseLessons.invalidate({ slug: courseSlug });

        await utils.course.getTeacherNextLessons.invalidate();
      },
    });

  // Mutación para eliminar una lección
  const { mutateAsync: deleteLesson } = api.lesson.removeLesson.useMutation({
    // Lógica de actualización optimista
    onMutate: async ({ id }) => {
      await utils.course.getCourseLessons.cancel({ slug: courseSlug });

      const previousLessons = utils.course.getCourseLessons.getData({
        slug: courseSlug,
      });

      const newLessons = previousLessons
        ?.filter((lesson) => lesson.id === id)
        .map((lesson, lessonIndex) => ({ ...lesson, order: lessonIndex }));

      utils.course.getCourseLessons.setData(
        { slug: courseSlug },
        () => newLessons,
      );

      return {
        previousLessons,
        newLessons: newLessons,
      };
    },
    onSuccess: async (_data, _variables) => {
      toast.success("Lección eliminada exitosamente");
    },
    onError: (e, _variables, context) => {
      // Revertir cambios en caso de error
      utils.course.getCourseLessons.setData(
        { slug: courseSlug },
        () => context?.previousLessons,
      );
      toast.error(e.message);
    },
    onSettled: async (error) => {
      if (error) return;

      // Invalidar consultas relacionadas después de la operación
      await utils.course.getCourseLessons.invalidate({ slug: courseSlug });

      await utils.course.getTeacherNextLessons.invalidate();
    },
  });

  // Mutación para eliminar el video de una lección
  const { mutateAsync: deleteLessonVideo } =
    api.uploadThing.deleteFile.useMutation({
      onSuccess: () => {
        toast.warning("El video de la lección ha sido eliminado.");
      },
      onError: (e) => {
        console.error("Error al eliminar el video de la lección", e);
      },
      onSettled: async (_data, error) => {
        if (error) return;

        await utils.course.getCourseLessons.invalidate({
          slug: courseSlug,
        });
      },
    });

  // Función para eliminar una lección y su video asociado
  async function removeLesson({ lessonId }: { lessonId: string }) {
    const deletedLesson = utils.course.getCourseLessons
      .getData()
      ?.find((lesson) => lesson.id === lessonId);

    const fileUrl = deletedLesson?.video;

    if (fileUrl) {
      await deleteLessonVideo({
        fileUrl,
      });
    }

    await deleteLesson({
      id: lessonId,
    });
  }

  // Función para manejar el envío del formulario
  async function onSubmit(values: LessonSchemaType) {
    await submitLesson(values);
  }

  // Renderizado del formulario
  return (
    <div className="rounded-lg px-2 py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  Título de la lección
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese el título de la lección"
                    {...field}
                    className="mt-1 bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  Descripción
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa la lección"
                    {...field}
                    className="mt-1 min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-lg font-semibold">
                    Fecha de inicio
                  </FormLabel>
                  <FormControl>
                    <DateTimePicker
                      {...field}
                      disabled={!!lesson.startDate}
                      hourCycle={12}
                      granularity="minute"
                      value={field.value ?? undefined}
                      locale={es}
                      className="mt-1 h-auto text-wrap"
                      placeholder="Selecciona una fecha"
                      displayFormat={{
                        hour12: "PP 'a las' h:mm a",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newDate"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-lg font-semibold">
                      Reagendar para
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        disabled={!form.getValues("startDate")}
                        {...field}
                        hourCycle={12}
                        granularity="minute"
                        value={field.value ?? undefined}
                        locale={es}
                        className="mt-1 h-auto text-wrap"
                        placeholder="Selecciona una fecha"
                        displayFormat={{
                          hour12: "PP 'a las' h:mm a",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="video"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  Video de la lección
                </FormLabel>
                <div className="mt-2 space-y-4">
                  {field.value ? (
                    <div className="py-4">
                      <video
                        src={field.value}
                        controls
                        className="max-h-[300px] w-full object-contain"
                      >
                        Tu navegador no soporta la reproducción de video.
                      </video>
                      <div className="mt-4 flex items-center justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => field.onChange(null)}
                        >
                          Eliminar video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <LessonVideoUploader
                      fieldOnChange={field.onChange}
                      lesson={lesson}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center justify-end gap-2 border-t pt-4 md:flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" type="button">
                  Eliminar lección
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                    {`Se eliminará la lección "${lesson.title}" del curso`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={() =>
                        removeLesson({ lessonId: form.getValues("id")! })
                      }
                      variant="destructive"
                      size="sm"
                    >
                      Confirmar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="submit" disabled={submittingLesson}>
              {submittingLesson ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
