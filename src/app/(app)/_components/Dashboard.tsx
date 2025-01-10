import React from "react";

import Sidebar from "./Sidebar";
import { auth } from "@/server/auth";

interface DashboardProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: DashboardProps) {
  const session = await auth();

  return (
    <div className="bg-primary-foreground min-h-screen w-full">
      {session && (
        <aside className="bg-background fixed inset-y-0 left-0 top-14 z-10 hidden w-12 flex-col border-r sm:flex">
          <Sidebar />
        </aside>
      )}
      <div className="fixed inset-y-0 bottom-0 left-0 right-0 top-14 overflow-y-auto sm:left-12">
        <div className="mx-auto h-full w-full max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
