import { notFound } from "next/navigation";
import { ComparisonReport } from "@/components/comparison-report";
import { getComparisonData } from "@/lib/data";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ student?: string; first?: string; second?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  if (id === "comparativo") {
    const comparison = await getComparisonData({ studentId: query.student, firstId: query.first, secondId: query.second });
    if (!comparison) notFound();

    return <ComparisonReport trainerProfile={comparison.trainer} student={comparison.student} first={comparison.first} second={comparison.second} />;
  }

  const comparison = await getComparisonData({ reportId: id });
  if (!comparison) notFound();

  return <ComparisonReport trainerProfile={comparison.trainer} student={comparison.student} first={comparison.first} second={comparison.second} />;
}
