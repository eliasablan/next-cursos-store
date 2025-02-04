"use client";

// #region imports
import React, { useEffect } from "react";
import { toast } from "sonner";
import { type api as serverApi } from "@/trpc/server";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useForm } from "react-hook-form";
import { MissionSchema, type MissionSchemaType } from "@/schemas/mission";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { es } from "date-fns/locale";
import NumberInput from "@/components/ui/number-input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
// #endregion

// #region Types
interface MissionFormProps {
  lessonId: string;
  mission?: Awaited<ReturnType<typeof serverApi.lesson.getLessonMission>>;
}
// #endregion

// #region Component
export default function MissionForm({ lessonId, mission }: MissionFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<MissionSchemaType>({
    resolver: zodResolver(MissionSchema),
    defaultValues: {
      id: mission?.id ?? undefined,
      title: mission?.title ?? "",
      score: mission?.score ?? 1,
      instructions: mission?.instructions ?? "",
      lessonId: mission?.lessonId ?? "",
      deadline: mission?.deadline ?? undefined,
    },
  });

  const { mutateAsync: submitMission, isPending } =
    api.mission.updateOrCreate.useMutation({
      onSuccess: ({ event, title }) => {
        if (event === "CREATED") {
          toast.success(`Misión: '"${title}"' creada exitosamente`);
        } else {
          toast.success(`Misión: '"${title}"' modificada exitosamente`);
        }
      },
      onError: (e) => {
        console.error(e);
        toast.error(e.message);
      },
      onSettled: async (data) => {
        console.log({ data });
        await utils.lesson.getLessonMission.invalidate({ lessonId });
        await utils.mission.getStudentPendingMissions.invalidate();
        await utils.mission.getTeacherPendingReviews.invalidate();
      },
    });

  // Form Submit
  async function onSubmit(values: MissionSchemaType) {
    await submitMission(values);
    router.refresh();
  }

  // Set 'lessonId' if mission is not provided
  useEffect(() => {
    if (!mission && lessonId) {
      form.setValue("lessonId", lessonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4 flex flex-col justify-between gap-4 rounded-md">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="Título de la misión"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Fecha de entrega</FormLabel>
                <FormControl>
                  <DateTimePicker
                    granularity="minute"
                    placeholder="Hora y fecha de entrega"
                    hourCycle={12}
                    locale={es}
                    modal={true}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntuación</FormLabel>
                <FormControl>
                  <NumberInput min={1} max={50} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrucciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Instrucciones de la misión"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="destructive">
              Cerrar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button disabled={isPending}>
              {isPending
                ? "Guardando..."
                : mission
                  ? "Guardar cambios"
                  : "Crear misión"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
// #endregion
