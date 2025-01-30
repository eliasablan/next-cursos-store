import { auth } from "@/server/auth";
import { SquareCheckBig } from "lucide-react";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <SquareCheckBig className="size-6" />
        Revisiones
      </h1>
    </main>
  );
}
