import { StudentManager } from "@/components/student-manager";
import { getAppData } from "@/lib/data";

export default async function StudentsPage() {
  const data = await getAppData();
  return <StudentManager initialStudents={data.students} />;
}
