import { DashboardOverview } from "@/components/dashboard-overview";
import { getAppData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getAppData();
  return <DashboardOverview data={data} today={new Date().toISOString().slice(0, 10)} />;
}
