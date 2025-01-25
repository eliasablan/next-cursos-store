import React from "react";

import Sidebar from "./Sidebar";
import { auth } from "@/server/auth";

interface DashboardProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: DashboardProps) {
  const session = await auth();

  return (
    <div className="min-h-screen w-full bg-primary-foreground">
      {session && (
        <aside className="fixed inset-y-0 left-0 top-14 z-10 hidden w-12 flex-col border-r bg-background md:flex">
          <Sidebar />
        </aside>
      )}
      <div className="fixed inset-y-0 bottom-0 left-0 right-0 top-14 overflow-y-auto md:left-12">
        <div className="mx-auto h-full w-full max-w-7xl p-4">{children}</div>
      </div>
    </div>
  );
}
