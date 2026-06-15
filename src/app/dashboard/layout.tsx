import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUser();
  return <AppShell>{children}</AppShell>;
}
