import { AssessmentForm } from "@/components/assessment-form";
import { getAppData } from "@/lib/data";

export default async function NewAssessmentPage() {
  const data = await getAppData();
  return <AssessmentForm students={data.students} />;
}
