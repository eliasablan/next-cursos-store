import { auth } from "@/server/auth";
import CourseForm from "./_components/CourseForm";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (!session) redirect("/ingresar");

  return <CourseForm />;
}
