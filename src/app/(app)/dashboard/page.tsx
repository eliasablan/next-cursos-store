import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Book, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function page() {
  const reviews = await api.mission.getStudentReviews();

  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 pb-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <LayoutDashboard className="size-6" />
        Dashboard
      </h1>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <CoursesCarouselCard />
        <Card>
          <CardHeader>
            <CardTitle>Misiones abiertas</CardTitle>
            <CardDescription>
              Completa misiones para ganar premios y conocer a tus compañeros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewsCarousel
              reviews={reviews.filter(
                (review) =>
                  review.status === "open" || review.status === "extended",
              )}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <div className="flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary-foreground/0 to-primary-foreground/100">
          <Image src="/astronaut.png" alt="banner" width={363} height={363} />
        </div>
      </div>
    </main>
  );
}

async function CoursesCarouselCard() {
  const session = await auth();

  const subscriptions = await api.subscription.getStudentSubscriptions({
    studentId: session?.user.id ?? "",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cursos</CardTitle>
        <CardDescription>Cursos a los que estás suscrito</CardDescription>
        <CardContent className="p-0">
          <Tabs defaultValue="coursing">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="finished">Finalizados</TabsTrigger>
                <TabsTrigger value="coursing">En progreso</TabsTrigger>
                <TabsTrigger value="incoming">Próximos</TabsTrigger>
              </TabsList>
            </div>
            {["finished", "coursing", "incoming"].map((tab) => {
              return (
                <TabsContent key={tab} value={tab}>
                  {subscriptions?.length ? (
                    <CoursesCarousel
                      courses={subscriptions
                        .filter(({ status }) => status === tab)
                        .map(({ course }) => course)}
                    />
                  ) : null}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </CardHeader>
    </Card>
  );
}

type CarouselCourse = Awaited<
  ReturnType<typeof api.subscription.getStudentSubscriptions>
>[0]["course"];

export function CoursesCarousel({ courses }: { courses: CarouselCourse[] }) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {courses.map((course, courseIndex) => (
          <CarouselItem key={course.id} className="sm:basis-1/2 xl:basis-1/3">
            <Link href={`/mis-cursos/${course.slug}`}>
              <Card className="flex h-full flex-col justify-between">
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
                <CardFooter>
                  <div className="flex w-full flex-col items-end gap-4">
                    <Progress
                      value={(courseIndex + 1) * 10}
                      className="w-full"
                      indicatorClassName={cn(
                        courseIndex * 10 === 100 && "bg-accent-foreground",
                      )}
                    />
                    <Book className="h-12 w-12" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {courses.length > 2 && (
        <>
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Order</span>
          </CarouselNext>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Order</span>
          </CarouselPrevious>
        </>
      )}
    </Carousel>
  );
}

type CarouselReview = Awaited<
  ReturnType<typeof api.mission.getStudentReviews>
>[0];

export function ReviewsCarousel({ reviews }: { reviews: CarouselReview[] }) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {reviews.map((review, index) => (
          <CarouselItem key={review.id} className="sm:basis-1/2 xl:basis-1/3">
            <Link href={`/misiones/${review.mission.id}`}>
              <Card className="flex h-full flex-col justify-between">
                <CardHeader>
                  <CardTitle>{review.mission.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex w-full flex-col items-end gap-4">
                    <p className="text-balance text-right text-xs text-muted-foreground">
                      {review.extension ? (
                        <span className="font-bold text-destructive">
                          Fecha de entrega extendida:{" "}
                        </span>
                      ) : (
                        <span className="font-bold">Fecha de entrega: </span>
                      )}
                      {format(
                        review.extension
                          ? review.extension
                          : review.mission.deadline,
                        "h:mm a 'de' PPP",
                        {
                          locale: es,
                        },
                      )}
                    </p>
                    <Progress
                      value={(index + 1) * 10}
                      className="w-full"
                      indicatorClassName={cn(
                        index * 10 === 100 && "bg-accent-foreground",
                      )}
                    />
                    <Book className="h-12 w-12" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {reviews.length > 2 && (
        <>
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Order</span>
          </CarouselNext>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Order</span>
          </CarouselPrevious>
        </>
      )}
    </Carousel>
  );
}
