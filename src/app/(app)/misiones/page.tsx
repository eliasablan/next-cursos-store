import { auth } from "@/server/auth";
import { Sword } from "lucide-react";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (!session) redirect("/ingresar");

  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <Sword className="size-6" />
        Misiones
      </h1>
    </main>
  );
}
