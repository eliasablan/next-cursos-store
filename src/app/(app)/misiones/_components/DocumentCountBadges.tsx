"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { File, Star } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";

export default function DocumentCountBadges({
  missionId,
}: {
  missionId: string;
}) {
  const { data: session } = useSession();

  const { data: mission } = api.mission.getMissionById.useQuery({
    id: missionId,
  });

  const review = mission?.reviews.find(
    (review) => review.subscription.studentId === session?.user.id,
  );

  const attachments = review?.attachments;
  const solutions = review?.attachments.filter(
    (attachment) => attachment.solution,
  );

  return (
    <div className="my-2 flex gap-2">
      <Badge className="mt-2" variant="secondary">
        <File size={12} fill="currentColor" className="mr-1" />
        {`${!attachments ? 0 : attachments.length} archivo${!attachments || attachments.length > 1 ? "s" : ""} subido${!attachments || attachments.length > 1 ? "s" : ""}`}
      </Badge>
      <Badge className="mt-2 items-center" variant="default">
        <Star size={12} fill="currentColor" className="mr-1" />
        {`${!solutions ? 0 : solutions.length} solucion${solutions && solutions.length > 1 ? "es" : ""} subida${!solutions || solutions.length > 1 ? "s" : ""}`}
      </Badge>
    </div>
  );
}
