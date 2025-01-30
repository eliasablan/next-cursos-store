import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <Dashboard>{children}</Dashboard>
    </>
  );
}
