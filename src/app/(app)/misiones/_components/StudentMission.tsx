import React, { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isBefore } from "date-fns";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MissionChat from "./MissionChat";
import ReviewDocumentsCard from "./ReviewDocumentsCard";
import UploadReviewDocumentButton from "./UploadReviewDocumentButton";
import { Separator } from "@/components/ui/separator";
import DocumentCountBadges from "./DocumentCountBadges";

export const generateMetadata = async ({
  params,
}: {
  params: { id: string };
}) => {
  const mission = await api.mission.getMissionById({ id: params.id });
  const title = mission?.title;
  const description = mission?.instructions;

  return {
    title,
    description,
  };
};

export default async function StudentMission({
  missionId,
}: {
  missionId: string;
}) {
  const session = await auth();
  if (!session?.user.id) return null;

  const mission = await api.mission.getMissionById({
    id: missionId,
  });

  const review = mission.reviews.find(
    (review) => review.subscription.studentId === session.user.id,
  );

  if (!review) redirect("/misiones");

  void (await api.message.getReviewMessages.prefetch({ reviewId: review.id }));

  const isOverdue = review.extension
    ? isBefore(review.extension, new Date())
    : isBefore(mission.deadline, new Date());

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <HydrateClient>
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Descripcion de la Mision */}
          <Card>
            <CardContent className="mt-6">
              <div className="grid gap-4 leading-tight sm:grid-cols-2">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold">
                      Fechas Importantes
                    </h3>
                    {review.extension ? (
                      <>
                        <p className="text-sm">
                          <span className="font-medium">
                            Fecha de extensión:
                          </span>{" "}
                          {format(review.extension, "PPP 'a las' h:mm a", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-primary">
                          <span className="font-medium">
                            Fecha original de entrega:
                          </span>{" "}
                          {format(mission.deadline, "PPP 'a las' h:mm a", {
                            locale: es,
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm">
                        <span className="font-medium">Fecha de entrega:</span>{" "}
                        {format(mission.deadline, "PPP 'a las' h:mm a", {
                          locale: es,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold">Instrucciones</h3>
                    <div
                      className={cn(
                        "w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-mono text-sm leading-relaxed",
                      )}
                    >
                      {mission.instructions}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">
                      Detalles de la Misión
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="col-span-2">
                        <span className="font-medium">Curso: </span>
                        <Link
                          className="text-primary hover:underline"
                          href={`/cursos/${mission.lesson.course?.slug}`}
                        >
                          {mission.lesson.course?.name}
                        </Link>
                      </p>
                      <p className="col-span-2">
                        <span className="font-medium">Lección: </span>
                        <span>{mission.lesson.title}</span>
                      </p>
                    </div>
                  </div>
                  {review?.score && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Evaluación</h4>
                        <div className="flex items-center justify-between">
                          <span>Calificación:</span>
                          <span
                            className={cn(
                              "text-2xl font-bold",
                              review.score < Math.round(mission.score * 0.5) &&
                                "text-red-500",
                              review.score > Math.round(mission.score * 0.75) &&
                                review.score < mission.score &&
                                "text-yellow-500",
                              review.score === mission.score &&
                                "text-green-500",
                            )}
                          >
                            {review.score} / {mission.score}
                          </span>
                        </div>
                        <div>
                          <p className="mb-1 font-medium">
                            Comentarios del profesor:
                          </p>
                          <p className="text-sm italic">
                            {review.teacherReview}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Documentos adjuntos */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle>Documentos compartidos</CardTitle>
                <DocumentCountBadges missionId={missionId} />
              </div>
              <UploadReviewDocumentButton
                reviewId={review.id}
                missionId={missionId}
                closed={isOverdue}
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <Suspense fallback={<Skeleton />}>
                  <ReviewDocumentsCard missionId={missionId} />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          {/* Chat con el profesor */}
          <MissionChat
            title="Chat con el profesor"
            reviewId={review.id}
            missionId={missionId}
            closed={isOverdue}
            otherEnd={mission.lesson.course?.ownerId}
          />
        </div>
      </HydrateClient>
    </div>
  );
}
