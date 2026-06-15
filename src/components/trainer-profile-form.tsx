"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Palette, Save, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTrainerAction } from "@/app/dashboard/perfil/actions";
import { useTrainerProfile } from "@/lib/trainer-profile-store";
import type { Trainer } from "@/lib/types";

export function TrainerProfileForm({ initialTrainer }: { initialTrainer: Trainer }) {
  const [trainer, setTrainer] = useState(initialTrainer);
  const [isPending, startTransition] = useTransition();
  const { saveTrainer } = useTrainerProfile();

  function update(key: keyof Trainer, value: string) {
    setTrainer((current) => ({ ...current, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      try {
        await updateTrainerAction(trainer);
        saveTrainer(trainer);
        toast.success("Perfil personalizado salvo no Supabase.");
      } catch (error) {
        saveTrainer(trainer);
        toast.error(error instanceof Error ? error.message : "Salvei localmente, mas nao consegui atualizar o Supabase.");
      }
    });
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Perfil do personal</h1>
        <p className="text-muted-foreground">Dados de marca usados nos relatorios profissionais.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundCog className="size-5 text-blue-500" />
              Identidade profissional
            </CardTitle>
            <CardDescription>Nome, logo, foto, contatos, frase e assinatura.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" value={trainer.name} onChange={(value) => update("name", value)} />
            <Field label="Instagram" value={trainer.instagram} onChange={(value) => update("instagram", value)} />
            <Field label="WhatsApp" value={trainer.whatsapp} onChange={(value) => update("whatsapp", value)} />
            <Field label="Logo URL" value={trainer.logoUrl} onChange={(value) => update("logoUrl", value)} />
            <Field label="Foto URL" value={trainer.photoUrl} onChange={(value) => update("photoUrl", value)} />
            <Field label="Cor primaria" type="color" value={trainer.brandPrimary} onChange={(value) => update("brandPrimary", value)} />
            <Field label="Cor secundaria" type="color" value={trainer.brandSecondary} onChange={(value) => update("brandSecondary", value)} />
            <div className="grid gap-2 md:col-span-2">
              <Label>Frase motivacional</Label>
              <Textarea value={trainer.motivationalPhrase} onChange={(event) => update("motivationalPhrase", event.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Assinatura no relatorio</Label>
              <Textarea value={trainer.reportSignature} onChange={(event) => update("reportSignature", event.target.value)} />
            </div>
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 md:col-span-2" disabled={isPending} onClick={save}>
              <Save className="size-4" />
              {isPending ? "Salvando..." : "Salvar perfil"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-blue-500" />
              Preview da marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md p-5 text-white" style={{ background: `linear-gradient(135deg, ${trainer.brandSecondary}, ${trainer.brandPrimary})` }}>
              <p className="text-sm opacity-80">FitReport Pro</p>
              <h2 className="mt-2 text-2xl font-black">{trainer.name}</h2>
              <p className="mt-8 text-sm">{trainer.motivationalPhrase}</p>
              <p className="mt-4 text-xs opacity-80">{trainer.reportSignature}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
