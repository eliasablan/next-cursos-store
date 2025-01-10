import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import Dashboard from "./_components/Dashboard";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <>
      <Header />
      <Dashboard>{children}</Dashboard>
    </>
  );
}
