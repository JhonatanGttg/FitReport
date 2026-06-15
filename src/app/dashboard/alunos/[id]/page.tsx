import { notFound } from "next/navigation";
import { StudentHistory } from "@/components/student-history";
import { getStudentHistoryData } from "@/lib/data";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getStudentHistoryData(id);
  if (!data) notFound();

  return <StudentHistory student={data.student} assessments={data.assessments} />;
}
