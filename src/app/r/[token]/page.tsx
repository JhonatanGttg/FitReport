import { notFound } from "next/navigation";
import { ComparisonReport } from "@/components/comparison-report";
import { getPublicReportData } from "@/lib/data";

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getPublicReportData(token);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <ComparisonReport
        trainerProfile={data.trainer}
        student={data.student}
        first={data.first}
        second={data.second}
        savedReport={data.report}
        readOnly
      />
    </main>
  );
}
