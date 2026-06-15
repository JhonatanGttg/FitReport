import Link from "next/link";
import { Activity, BarChart3, Dumbbell, FileText, UserRoundCog, UsersRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { demoData } from "@/lib/demo-data";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/alunos", label: "Alunos", icon: UsersRound },
  { href: "/dashboard/avaliacoes/nova", label: "Nova avaliacao", icon: Activity },
  { href: "/dashboard/relatorios", label: "Relatorios", icon: FileText },
  { href: "/dashboard/perfil", label: "Perfil", icon: UserRoundCog },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-sidebar/80 p-5 backdrop-blur xl:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Dumbbell className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight">FitReport Pro</span>
            <span className="text-xs text-muted-foreground">{demoData.trainer.motivationalPhrase}</span>
          </span>
        </Link>
        <nav className="mt-10 grid gap-2">
          {nav.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="h-11 justify-start gap-3 rounded-md">
              <Link href={item.href}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <div className="xl:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/88 px-4 backdrop-blur md:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-black xl:hidden">
            <Dumbbell className="size-5 text-blue-600" />
            FitReport Pro
          </Link>
          <div className="hidden text-sm text-muted-foreground xl:block">Workspace de {demoData.trainer.name}</div>
          <div className="flex items-center gap-2">
            <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/dashboard/avaliacoes/nova">
                <Activity className="size-4" />
                Nova avaliacao
              </Link>
            </Button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
