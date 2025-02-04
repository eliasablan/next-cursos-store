import React from "react";
import { auth } from "@/server/auth";
import StudentMission from "../_components/StudentMission";
import GoBackButton from "@/components/GoBackButton";
import { api } from "@/trpc/server";

export default async function missionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: missionId } = await params;
  const session = await auth();
  const role = session?.user.role;
  if (!role) return null;

  const mission = await api.mission.getMissionById({
    id: missionId,
  });

  return (
    <main className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <GoBackButton />
        <p className="whitespace-wrap flex-1">
          <span className="text-xl font-medium tracking-tight">
            {"Resumen de la misión: "}
          </span>
          <span className="text-xl font-bold tracking-tight">
            {mission?.title}
          </span>
          <span className="ml-2 text-sm tracking-tight text-muted-foreground">
            {"de la lección "}
            {`"${mission?.lesson.title}"`}
            {" del curso "}
            {`"${mission?.lesson.course?.name}"`}
          </span>
        </p>
      </div>

      <StudentMission missionId={missionId} />
    </main>
  );
}
