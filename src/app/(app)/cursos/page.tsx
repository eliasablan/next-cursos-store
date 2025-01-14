import { Box } from "lucide-react";

export default async function Cursos() {
  return (
    <main className="grid w-full grid-cols-1 gap-4 gap-x-4 lg:grid-cols-3">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <Box className="size-6" />
        Cursos
      </h1>
    </main>
  );
}
