import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Book, BookCopy, CircleDollarSign } from "lucide-react";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (!session) redirect("/ingresar");

  const subscriptions = await api.subs.getStudentSubscriptions({
    studentId: session?.user.id ?? "",
  });

  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <BookCopy className="size-6" />
        Mis cursos
      </h1>
      <Tabs defaultValue="coursing" className="col-span-full">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="coursing">En progreso</TabsTrigger>
            <TabsTrigger value="incoming">Próximos</TabsTrigger>
          </TabsList>
        </div>
        <SubscriptionsTab
          title="Cursos finalizados"
          status="finished"
          subscriptions={subscriptions.filter(
            (subscription) => subscription.status === "finished",
          )}
        />
        <SubscriptionsTab
          title="Cursos iniciados"
          status="coursing"
          subscriptions={subscriptions.filter(
            (subscription) => subscription.status === "coursing",
          )}
        />
        <SubscriptionsTab
          title="Cursos por empezar"
          status="incoming"
          subscriptions={subscriptions.filter(
            (subscription) => subscription.status === "incoming",
          )}
        />
      </Tabs>
    </main>
  );
}

type TabProps = {
  subscriptions: Awaited<ReturnType<typeof api.subs.getStudentSubscriptions>>;
  status: string;
  title: string;
};

function SubscriptionsTab({ subscriptions, status, title }: TabProps) {
  return (
    <TabsContent value={status}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {!subscriptions.length && <p>No tienes suscripciones</p>}
            {subscriptions.map((subscription) => (
              <Link
                key={subscription.id}
                href={`/cursos/${subscription.course.slug}`}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{subscription.course.name}</CardTitle>
                    <CardDescription>
                      {subscription.course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex w-full flex-col items-end justify-between gap-8">
                      {subscription.paid ? (
                        <Book className="h-12 w-12 text-primary" />
                      ) : (
                        <CircleDollarSign className="h-12 w-12 text-warning" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
