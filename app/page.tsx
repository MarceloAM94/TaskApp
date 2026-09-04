import ClientBoard from "@/components/board/ClientBoard";
import { getTasks } from "@/actions/tasks";
import { getCourses } from "@/actions/courses";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tasks, courses] = await Promise.all([getTasks(), getCourses()]);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <ClientBoard initialTasks={tasks} courses={courses} />
    </main>
  );
}
