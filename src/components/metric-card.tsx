import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden rounded-md border-blue-500/10 bg-card/80 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/40">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-md bg-blue-600/10 text-blue-500">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
