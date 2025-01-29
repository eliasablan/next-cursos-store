"use client";

// #region imports
import React, { useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { CalendarIcon, ChevronLeft } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, slugify } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CourseSchema, type CourseSchemaType } from "@/schemas/course";
import GoBackButton from "@/components/GoBackButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
// #endregion

// #region CourseForm
export default function CourseForm() {
  const { slug: courseSlug } = useParams<{ slug?: string }>();

  const { data: course } = api.course.getCourseBySlug.useQuery(
    {
      slug: courseSlug!,
    },
    {
      enabled: !!courseSlug,
    },
  );

  const router = useRouter();
  const utils = api.useUtils();
  const form = useForm({
    resolver: zodResolver(CourseSchema),
    defaultValues: {
      id: course?.id ?? "",
      name: course?.name ?? "",
      slug: course?.slug ?? "",
      description: course?.description ?? "",
      startDate: course?.startDate ?? undefined,
      endDate: course?.endDate ?? undefined,
      lessons: course?.lessons ?? [],
    },
  });

  const {
    formState: { isDirty, dirtyFields },
    watch,
    setValue,
    handleSubmit,
  } = form;

  const { mutateAsync: submitCourse, isPending } =
    api.course.updateOrCreate.useMutation({
      onSuccess: async ({ event, name }) => {
        if (event === "CREATED") {
          toast.success(`Curso: "${name}" creado exitosamente`);
        } else {
          toast.success(`Curso: "${name}" modificado exitosamente`);
        }
      },
      onError: (e) => {
        toast.error(e.message);
      },
      onSettled: async (data, error) => {
        if (error ?? !data) return;
        const { slug } = data;
        await utils.course.getCourseBySlug.invalidate({ slug });
      },
    });

  const name = watch("name");

  // Slug generation based on Course name
  useEffect(() => {
    if (dirtyFields.name) {
      const trimmedName = name.substring(0, 40);
      setValue("slug", slugify(trimmedName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Populates the form once the course data is loaded
  useEffect(() => {
    if (course) {
      form.setValue("id", course.id ?? "");
      form.setValue("name", course.name ?? "");
      form.setValue("slug", course.slug);
      form.setValue("description", course.description ?? "");
      form.setValue("startDate", course.startDate);
      form.setValue("endDate", course.endDate);
    }
  }, [course, form]);

  // Form Submit and Course and Lessons creation
  async function onSubmit(values: CourseSchemaType) {
    const { slug } = await submitCourse(values);

    router.push(`/cursos-publicados/${slug}`);
  }

  return (
    <main className="grid w-full flex-1 auto-rows-max gap-4 pb-4">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* HEADER */}
          <div className="mb-4 flex items-center gap-4">
            {isDirty ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Estás seguro?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={() => {
                        router.back();
                      }}
                      variant="destructive"
                      size="sm"
                      className="ml-auto"
                    >
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <GoBackButton />
            )}
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {course?.name ?? "Nuevo curso"}
            </h1>
            {course?.id && <Badge variant="warning">MODO EDICION</Badge>}
            {/* BOTONES */}
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              {isDirty ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Descartar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Estás seguro?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" size="sm">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={() => {
                          router.back();
                        }}
                        variant="destructive"
                        size="sm"
                        className="ml-auto"
                      >
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="destructive"
                >
                  Descartar
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                Guardar
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
              {/* DETALLES */}

              <Card>
                <CardContent className="mt-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del curso</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dale nombre al curso"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormDescription>
                            Indentificador único para ser usado en la URL del
                            curso
                          </FormDescription>
                          <FormControl>
                            <Input
                              placeholder="Asigna un slug único al curso"
                              maxLength={40}
                              {...field}
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
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Resume contenido de tu curso y destaca sus aspectos más llamativos"
                              className="h-96"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4">
              {/* FECHAS DEL CURSO */}
              <Card>
                <CardContent className="mt-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                // disabled={(date) =>
                                //   date > new Date() ||
                                //   date < new Date("1900-01-01")
                                // }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de finalización</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                // disabled={(date) =>
                                //   date > new Date() ||
                                //   date < new Date("1900-01-01")
                                // }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* FECHAS DE EDICIÓN */}
              {course?.id && (
                <Card>
                  <CardContent className="mt-6">
                    <div className="grid gap-6">
                      {course?.createdAt && (
                        <div>
                          <Label>Fecha de creación</Label>
                          <Input
                            disabled
                            className="mt-2"
                            value={format(
                              new Date(course.createdAt),
                              "PP 'a las' h:mm a",
                              { locale: es },
                            )}
                          />
                        </div>
                      )}
                      {course?.updatedAt && (
                        <div>
                          <Label>Fecha de última edición</Label>
                          <Input
                            disabled
                            className="mt-2"
                            value={format(new Date(), "PP 'a las' h:mm a", {
                              locale: es,
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          {/* BOTONES */}
          <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
            {isDirty ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Descartar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Estás seguro?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={() => {
                        router.back();
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                type="button"
                onClick={() => router.back()}
                variant="destructive"
              >
                Descartar
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
// #endregion
