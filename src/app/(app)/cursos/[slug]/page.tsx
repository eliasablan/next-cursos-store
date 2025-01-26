import React from "react";
import {
  ChevronLeft,
  LockKeyhole,
  RocketIcon,
  SquarePlayIcon,
} from "lucide-react";
import GoBackButton from "@/components/GoBackButton";
import { api } from "@/trpc/server";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { es } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Video from "next-video";
import Link from "next/link";

interface CursoProps {
  params: Promise<{
    slug: string;
  }>;
}

export const generateMetadata = async ({ params }: CursoProps) => {
  const { slug } = await params;
  const curso = await api.course.getCourseBySlug({ slug });
  const title = curso?.name;
  const description = curso?.description;

  return {
    title,
    description,
  };
};

export default async function Curso({ params }: CursoProps) {
  const { slug } = await params;
  const course = await api.course.getCourseBySlug({ slug });

  if (!course) return null;

  const subscription = await api.subs.getSubscriptionByCourseId({
    courseId: course.id,
  });

  return (
    <main className="grid w-full flex-1 auto-rows-max p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <GoBackButton className="h-7 w-7" size="icon" variant="outline">
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Regresar</span>
          </>
        </GoBackButton>
        <p className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Regresar
        </p>
      </div>
      <div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            {/* DETALLES */}
            <Card>
              <CardHeader>
                <CardTitle>{course?.name}</CardTitle>
                <CardDescription>{course?.description}</CardDescription>
              </CardHeader>
            </Card>
            {/* LECCIONES */}
            <Card>
              <CardHeader>
                <CardTitle>Lecciones</CardTitle>
                <CardDescription>
                  {course?.lessons.length} lecciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!subscription?.paid ? (
                  <div className="flex items-center justify-center p-2">
                    <LockKeyhole className="h-8 w-8" />
                  </div>
                ) : (
                  <Accordion type="single" collapsible>
                    {course?.lessons.map((lesson, index) => (
                      <AccordionItem key={index} value={index.toString()}>
                        <AccordionTrigger>{lesson.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {lesson.mission ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={`/misiones/${lesson.mission.id}`}
                                    >
                                      <RocketIcon className="h-4 w-4" />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>Misión</TooltipContent>
                                </Tooltip>
                              ) : null}
                              {lesson.video ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={lesson.video}>
                                      <SquarePlayIcon className="h-4 w-4" />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>Video</TooltipContent>
                                </Tooltip>
                              ) : null}
                            </div>
                            {/* <div>
                              <p className="font-medium text-muted-foreground">
                                {format(
                                  new Date(
                                    lesson.newDate
                                      ? lesson.newDate
                                      : lesson.startDate,
                                  ),
                                  "PPP 'a las' h:mm a",
                                  {
                                    locale: es,
                                  },
                                )}
                              </p>
                              {lesson.newDate && (
                                <p className="text-xs font-medium text-destructive">
                                  Fecha original:{" "}
                                  {format(
                                    new Date(lesson.startDate),
                                    "PPP 'a las' h:mm a",
                                    {
                                      locale: es,
                                    },
                                  )}
                                </p>
                              )}
                            </div> */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" type="button">
                                  Ver más
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{lesson.title}</DialogTitle>
                                  <DialogDescription>
                                    {lesson.description}
                                  </DialogDescription>
                                  <DialogContent showCloseButton={false}>
                                    <DialogHeader>
                                      <DialogTitle>{lesson.title}</DialogTitle>
                                      <DialogDescription>
                                        {lesson.description}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {lesson.video && (
                                      <Video src={lesson.video} />
                                    )}
                                  </DialogContent>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            {/* FECHAS DEL CURSO */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-3 sm:col-span-2">
                    <Label>Fecha de inicio</Label>
                    <Input
                      disabled
                      value={format(new Date(course?.startDate ?? ""), "PPP", {
                        locale: es,
                      })}
                    />
                  </div>
                  <div className="grid gap-3 sm:col-span-2">
                    <Label>Fecha de finalización</Label>
                    <Input
                      disabled
                      value={format(new Date(course?.endDate ?? ""), "PPP", {
                        locale: es,
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
