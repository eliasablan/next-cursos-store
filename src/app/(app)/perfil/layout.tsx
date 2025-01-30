import React from "react";
import type { Metadata } from "next";
import ProfilePageNav from "./_components/ProfilePageNav";
import { User } from "lucide-react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function Profile({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <main className="relative grid w-full grid-cols-6 gap-4 pb-4">
      <h1 className="col-span-full flex items-center gap-2 text-2xl font-semibold">
        <User className="size-6" />
        Perfil
      </h1>
      <ProfilePageNav className="col-span-full my-4 h-fit md:col-span-1" />
      <div className="col-span-full grid gap-6 md:col-span-5">{children}</div>
    </main>
  );
}
