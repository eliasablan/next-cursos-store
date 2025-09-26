import React from "react";
import { ChevronLeft, SwordIcon } from "lucide-react";
import GoBackButton from "@/components/GoBackButton";
import { api } from "@/trpc/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
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
import SubscriptionPaymentButton from "../_components/SubscriptionPaymentButton";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";

interface CursoProps {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({ params }: CursoProps) => {
  const { slug } = await params;
  const curso = await api.course.getCourseBySlug({ slug });
  const title = curso?.name;
  const description = curso?.description;

  return { title, description };
};

export default async function Curso({ params }: CursoProps) {
  const { slug } = await params;
  const course = await api.course.getCourseBySlug({ slug });
  const session = await auth();
  if (!course) return null;

  const subscription = await api.subs.getSubscriptionByCourseId({
    courseId: course.id,
  });

  return (
    <main className="grid w-full flex-1 auto-rows-max">
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
                {subscription?.paid || session?.user.id === course.ownerId ? (
                  <Accordion type="single" collapsible>
                    {course?.lessons.map((lesson, index) => (
                      <AccordionItem key={index} value={index.toString()}>
                        <AccordionTrigger>{lesson.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-col items-center justify-center gap-2">
                              {(lesson.newDate ?? lesson.startDate) && (
                                <p className="font-medium text-muted-foreground">
                                  {format(
                                    new Date(
                                      lesson.newDate ?? lesson.startDate!,
                                    ),
                                    "PPP 'a las' h:mm a",
                                    { locale: es },
                                  )}
                                </p>
                              )}
                              {lesson.newDate && (
                                <p className="text-xs font-medium text-destructive">
                                  Fecha original:{" "}
                                  {format(
                                    new Date(lesson.startDate!),
                                    "PPP 'a las' h:mm a",
                                    { locale: es },
                                  )}
                                </p>
                              )}
                              {lesson.mission && (
                                <Button variant="link" asChild>
                                  <Link
                                    href={`/misiones/${lesson.mission?.id}`}
                                  >
                                    <SwordIcon className="mr-1 h-4 w-4" />
                                    {lesson.mission.title}
                                  </Link>
                                </Button>
                              )}
                            </div>
                            <ResponsiveDialog>
                              <ResponsiveDialogTrigger asChild>
                                <Button variant="outline" type="button">
                                  Ver más
                                </Button>
                              </ResponsiveDialogTrigger>
                              <ResponsiveDialogContent>
                                <ResponsiveDialogHeader>
                                  <ResponsiveDialogTitle>
                                    {lesson.title}
                                  </ResponsiveDialogTitle>
                                  <ResponsiveDialogDescription>
                                    {lesson.description}
                                  </ResponsiveDialogDescription>
                                  <ResponsiveDialogContent>
                                    <ResponsiveDialogHeader>
                                      <ResponsiveDialogTitle>
                                        {lesson.title}
                                      </ResponsiveDialogTitle>
                                      <ResponsiveDialogDescription>
                                        {lesson.description}
                                      </ResponsiveDialogDescription>
                                    </ResponsiveDialogHeader>
                                    {lesson.video && (
                                      <video
                                        src={lesson.video}
                                        controls
                                        className="max-h-[300px] w-full object-contain"
                                      >
                                        Tu navegador no soporta la reproducción
                                        de video.
                                      </video>
                                    )}
                                  </ResponsiveDialogContent>
                                </ResponsiveDialogHeader>
                              </ResponsiveDialogContent>
                            </ResponsiveDialog>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <SubscriptionPaymentButton
                    courseId={course.id}
                    courseSlug={slug}
                    subscriptionId={subscription?.id}
                    stripePriceId={course.stripePriceId!}
                  />
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
