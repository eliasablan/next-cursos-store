import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

import EncryptButton from "@/components/EncryptButton";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <EncryptButton />
        {children}
      </div>
    </main>
  );
}
