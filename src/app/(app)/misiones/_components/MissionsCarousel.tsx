import React from "react";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Book,
  ChevronLeft,
  ChevronRight,
  User,
  Notebook,
  Clock,
} from "lucide-react";

// import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
// import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MissionsCarousel() {
  const missions = await api.mission.getStudentMissions();

  return (
    <Tabs defaultValue="open">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="closed">Cerradas</TabsTrigger>
          <TabsTrigger value="open">Abiertas</TabsTrigger>
          <TabsTrigger value="extended">Extendidas</TabsTrigger>
        </TabsList>
      </div>
      {["closed", "open", "extended"].map(
        (tab) =>
          missions.filter((mission) => mission.status === tab).length > 0 && (
            <TabsContent key={tab} value={tab}>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {missions
                    .filter((mission) => mission.status === tab)
                    .map((mission) => {
                      const extensionDate = mission.reviews?.reduce(
                        (
                          maxDate: Date | null,
                          review: { extension: Date | null },
                        ) => {
                          if (
                            !maxDate ||
                            (review.extension &&
                              new Date(review.extension) > new Date(maxDate))
                          ) {
                            return review.extension;
                          }
                          return maxDate;
                        },
                        null,
                      );
                      return (
                        <CarouselItem
                          key={mission.id}
                          className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                        >
                          <Link href={`/misiones/${mission.id}`}>
                            <Card className="flex h-full flex-col justify-between transition-all hover:shadow-md">
                              <CardHeader className="pb-2">
                                <CardTitle className="pb-2 text-xl font-bold">
                                  {mission.title}
                                </CardTitle>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  <p className="flex items-center">
                                    <Book className="mr-2 h-4 w-4" />
                                    {mission.lesson?.title ||
                                      "Lección no especificada"}
                                  </p>
                                  <p className="flex items-center">
                                    <Notebook className="mr-2 h-4 w-4" />
                                    {mission.course?.name ??
                                      "Curso no especificado"}
                                  </p>
                                  <p className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    {mission.teacher?.name ??
                                      "Profesor no especificado"}
                                  </p>
                                </div>
                              </CardHeader>
                              <CardFooter className="flex flex-col items-start pt-2">
                                {mission.deadline && (
                                  <div className="mb-2 flex items-center text-sm">
                                    <Clock className="mr-2 h-4 w-4 text-destructive" />
                                    <span className="font-medium">
                                      {!extensionDate
                                        ? "Entrega: "
                                        : "Extendido: "}
                                      {format(
                                        new Date(
                                          extensionDate
                                            ? extensionDate
                                            : mission.deadline,
                                        ),
                                        "d 'de' MMMM, yyyy",
                                        { locale: es },
                                      )}
                                    </span>
                                  </div>
                                )}
                              </CardFooter>
                            </Card>
                          </Link>
                        </CarouselItem>
                      );
                    })}
                </CarouselContent>
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Siguiente misión</span>
                </CarouselNext>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Misión anterior</span>
                </CarouselPrevious>
              </Carousel>
            </TabsContent>
          ),
      )}
    </Tabs>
  );
}
