import { Rocket } from "lucide-react";

export default async function Misiones() {
  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <Rocket className="size-6" />
        Misiones
      </h1>
    </main>
  );
}
