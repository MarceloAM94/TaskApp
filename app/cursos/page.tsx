import ClientCourses from "@/components/courses/ClientCourses";
import { getCourses } from "@/actions/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">
      <ClientCourses initialCourses={courses} />
    </main>
  );
}
