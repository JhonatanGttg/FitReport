alter table public.users enable row level security;
alter table public.trainers enable row level security;
alter table public.students enable row level security;
alter table public.assessments enable row level security;
alter table public.body_measurements enable row level security;
alter table public.skinfolds enable row level security;
alter table public.reports enable row level security;

drop policy if exists "usuarios veem apenas o proprio cadastro" on public.users;
create policy "usuarios veem apenas o proprio cadastro"
on public.users for all
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "personais veem apenas o proprio perfil" on public.trainers;
create policy "personais veem apenas o proprio perfil"
on public.trainers for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "personais veem apenas os proprios alunos" on public.students;
create policy "personais veem apenas os proprios alunos"
on public.students for all
using (trainer_id in (select id from public.trainers where user_id = auth.uid()))
with check (trainer_id in (select id from public.trainers where user_id = auth.uid()));

drop policy if exists "personais veem apenas as proprias avaliacoes" on public.assessments;
create policy "personais veem apenas as proprias avaliacoes"
on public.assessments for all
using (trainer_id in (select id from public.trainers where user_id = auth.uid()))
with check (trainer_id in (select id from public.trainers where user_id = auth.uid()));

drop policy if exists "personais veem apenas medidas das proprias avaliacoes" on public.body_measurements;
create policy "personais veem apenas medidas das proprias avaliacoes"
on public.body_measurements for all
using (assessment_id in (
  select a.id from public.assessments a
  join public.trainers t on t.id = a.trainer_id
  where t.user_id = auth.uid()
))
with check (assessment_id in (
  select a.id from public.assessments a
  join public.trainers t on t.id = a.trainer_id
  where t.user_id = auth.uid()
));

drop policy if exists "personais veem apenas dobras das proprias avaliacoes" on public.skinfolds;
create policy "personais veem apenas dobras das proprias avaliacoes"
on public.skinfolds for all
using (assessment_id in (
  select a.id from public.assessments a
  join public.trainers t on t.id = a.trainer_id
  where t.user_id = auth.uid()
))
with check (assessment_id in (
  select a.id from public.assessments a
  join public.trainers t on t.id = a.trainer_id
  where t.user_id = auth.uid()
));

drop policy if exists "personais veem apenas os proprios relatorios" on public.reports;
create policy "personais veem apenas os proprios relatorios"
on public.reports for all
using (trainer_id in (select id from public.trainers where user_id = auth.uid()))
with check (trainer_id in (select id from public.trainers where user_id = auth.uid()));

drop policy if exists "relatorios publicos podem ser lidos por token" on public.reports;
create policy "relatorios publicos podem ser lidos por token"
on public.reports for select
using (
  public_enabled = true
  and public_token <> ''
  and (public_expires_at is null or public_expires_at > now())
);
