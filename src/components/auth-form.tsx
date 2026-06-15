"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Dumbbell,
  FileText,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { provisionTrainerProfileAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" | "reset" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const copy = {
    login: {
      eyebrow: "Bem-vindo de volta",
      title: "Entre no seu centro de evolucao",
      description: "Acesse alunos, acompanhamentos, relatorios e sua identidade profissional.",
      cta: "Entrar",
    },
    signup: {
      eyebrow: "Comece seu workspace",
      title: "Crie seu perfil de personal",
      description: "Seu cadastro cria um perfil isolado, com alunos e relatorios separados dos outros personais.",
      cta: "Criar conta",
    },
    reset: {
      eyebrow: "Recuperacao segura",
      title: "Redefina sua senha",
      description: "Enviaremos um link de recuperacao para o e-mail cadastrado.",
      cta: "Enviar link",
    },
  }[mode];

  async function submit(formData: FormData) {
    setLoading(true);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const supabase = createClient();

    try {
      if (!supabase) throw new Error("Supabase nao configurado.");

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;

        if (data.user) {
          await provisionTrainerProfileAction({
            userId: data.user.id,
            email,
            name,
          });
        }

        if (data.session) {
          toast.success("Conta criada e perfil sincronizado.");
          router.push("/dashboard/perfil");
          router.refresh();
        } else {
          toast.success("Conta criada. Confirme seu e-mail para entrar.");
          router.push("/login");
        }
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("E-mail de recuperacao enviado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.38),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.24),transparent_28%),linear-gradient(135deg,#030712,#061841_52%,#020617)]" />
          <div className="absolute -right-24 top-20 h-96 w-96 rotate-12 border border-blue-400/20 bg-[repeating-linear-gradient(135deg,rgba(37,99,235,0.35)_0_4px,transparent_4px_14px)]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-md bg-white text-[#030712] shadow-2xl shadow-blue-950/40">
                <Dumbbell className="size-8" />
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">FitReport Pro</p>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-200">Physical assessment studio</p>
              </div>
            </div>

            <div className="mt-20 max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-blue-300/25 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-100">
                <Sparkles className="size-4" />
                Relatorios fitness premium
              </p>
              <h1 className="text-6xl font-black uppercase leading-[0.95] tracking-tight">
                Sua marca no centro da evolucao do aluno.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Cada personal tem perfil proprio, alunos isolados, historico de acompanhamento e relatorios comparativos com visual profissional.
              </p>
            </div>
          </div>

          <div className="relative grid gap-3 md:grid-cols-3">
            <BrandStat icon={UserRound} label="Perfis" value="Multi-personal" />
            <BrandStat icon={BarChart3} label="Evolucao" value="Comparativos" />
            <BrandStat icon={FileText} label="Entrega" value="PDF premium" />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid size-12 place-items-center rounded-md bg-blue-600 text-white">
                <Dumbbell className="size-6" />
              </div>
              <div>
                <p className="text-xl font-black">FitReport Pro</p>
                <p className="text-xs text-slate-400">Relatorios fitness premium</p>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.06] p-1 shadow-2xl shadow-blue-950/30 backdrop-blur">
              <div className="rounded-[6px] bg-slate-950/70 p-6 sm:p-8">
                <div className="mb-7">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-md bg-blue-600/15 px-3 py-1 text-sm font-bold text-blue-200">
                    <ShieldCheck className="size-4" />
                    {copy.eyebrow}
                  </p>
                  <h2 className="text-3xl font-black tracking-tight">{copy.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{copy.description}</p>
                </div>

                <form action={submit} className="grid gap-4">
                  {mode === "signup" ? (
                    <AuthField icon={UserRound} label="Nome do personal" id="name">
                      <Input id="name" name="name" type="text" placeholder="Ex: Luiz Gustavo" required className="h-11 bg-white/5 pl-10 text-white" />
                    </AuthField>
                  ) : null}

                  <AuthField icon={Mail} label="E-mail" id="email">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="voce@email.com"
                      defaultValue={mode === "signup" ? "" : "personal@fitreport.pro"}
                      required
                      className="h-11 bg-white/5 pl-10 text-white"
                    />
                  </AuthField>

                  {mode !== "reset" ? (
                    <AuthField icon={LockKeyhole} label="Senha" id="password">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimo de 6 caracteres"
                        defaultValue={mode === "signup" ? "" : "fitreport"}
                        minLength={6}
                        required
                        className="h-11 bg-white/5 pl-10 text-white"
                      />
                    </AuthField>
                  ) : null}

                  <Button type="submit" size="lg" className="mt-2 h-11 gap-2 bg-blue-600 text-white hover:bg-blue-500" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    {copy.cta}
                  </Button>
                </form>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
                  <AuthLink href="/login" active={mode === "login"}>Login</AuthLink>
                  <AuthLink href="/cadastro" active={mode === "signup"}>Cadastro</AuthLink>
                  <AuthLink href="/recuperar-senha" active={mode === "reset"}>Senha</AuthLink>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-300" />
                  <p>Ao cadastrar, seu perfil profissional fica sincronizado com o Supabase e seus alunos ficam isolados dos outros personais.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthField({
  icon: Icon,
  label,
  id,
  children,
}: {
  icon: typeof Mail;
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-slate-200">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-300" />
        {children}
      </div>
    </div>
  );
}

function AuthLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={active ? "rounded-md bg-blue-600 px-3 py-2 font-bold text-white" : "rounded-md bg-white/5 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white"}
    >
      {children}
    </Link>
  );
}

function BrandStat({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
      <Icon className="mb-4 size-6 text-blue-300" />
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
