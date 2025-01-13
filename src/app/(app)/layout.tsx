import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

import Header from "./_components/Header";
import Dashboard from "./_components/Dashboard";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <Dashboard>{children}</Dashboard>
    </>
  );
}
