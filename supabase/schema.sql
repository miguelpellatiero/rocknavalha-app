-- ROCK & NAVALHA: rode tudo no Supabase > SQL Editor
create extension if not exists pg_cron with schema pg_catalog;

create table public.barbers(id uuid primary key default gen_random_uuid(), name text not null unique, active boolean not null default true);
create table public.services(id uuid primary key default gen_random_uuid(), name text not null, price_cents int check(price_cents>=0), sort int not null default 0, active boolean not null default true);
create table public.plans(id uuid primary key default gen_random_uuid(), name text not null, price_cents int not null check(price_cents>=0), details text, active boolean not null default true);
create table public.hours(weekday int primary key check(weekday between 0 and 6), opens time, closes time); -- null = fechado
create table public.appointments(
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services on delete set null,
  service_name text not null,
  barber_id uuid references public.barbers on delete set null,
  starts_at timestamptz not null,
  name text not null check(char_length(name) between 2 and 60),
  phone text not null check(char_length(phone) between 10 and 20),
  created_at timestamptz not null default now());
create unique index on public.appointments(barber_id, starts_at);
create table public.subscribers(
  id uuid primary key default gen_random_uuid(),
  email text not null unique check(char_length(email)<=120 and email ~* '^[a-z0-9][^@\s]*@[^@\s]+\.[^@\s]+$'),
  consent_at timestamptz not null default now(),
  token uuid not null default gen_random_uuid());
create table public.admins(user_id uuid primary key references auth.users on delete cascade);

create function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;

-- RLS: tudo fechado; admin faz tudo; visitante só lê o catálogo público
do $$ declare t text; begin
  foreach t in array array['barbers','services','plans','hours','appointments','subscribers','admins'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy "admin total" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
  end loop; end $$;
create policy "publico le" on public.services for select to anon,authenticated using (active);
create policy "publico le" on public.plans    for select to anon,authenticated using (active);
create policy "publico le" on public.barbers  for select to anon,authenticated using (active);
create policy "publico le" on public.hours    for select to anon,authenticated using (true);

-- Funções públicas (o visitante NUNCA lê a tabela de agendamentos)
create function public.taken_slots(p_day date) returns table(barber_id uuid, hhmm text)
language sql stable security definer set search_path=public as $$
  select a.barber_id, to_char(a.starts_at at time zone 'America/Sao_Paulo','HH24:MI') from public.appointments a
  where (a.starts_at at time zone 'America/Sao_Paulo')::date = p_day $$;

create function public.book(p_service uuid, p_barber uuid, p_day date, p_time text, p_name text, p_phone text) returns text
language plpgsql security definer set search_path=public as $$
declare ts timestamptz; h public.hours%rowtype; b uuid; sname text;
begin
  if p_time !~ '^\d\d:\d\d$' then raise exception 'data_invalida'; end if;
  ts := (p_day::text||' '||p_time)::timestamp at time zone 'America/Sao_Paulo';
  if ts < now()+interval '30 minutes' or ts > now()+interval '15 days' then raise exception 'data_invalida'; end if;
  select * into h from public.hours where weekday=extract(dow from p_day)::int;
  if h.opens is null or p_time::time < h.opens or p_time::time >= h.closes then raise exception 'fechado'; end if;
  select name into sname from public.services where id=p_service and active;
  if sname is null then raise exception 'servico_invalido'; end if;
  if p_barber is null then
    select id into b from public.barbers where active and id not in
      (select barber_id from public.appointments where starts_at=ts and barber_id is not null) order by name limit 1;
  else
    select id into b from public.barbers where id=p_barber and active;
  end if;
  if b is null then raise exception 'indisponivel'; end if;
  insert into public.appointments(service_id,service_name,barber_id,starts_at,name,phone)
    values(p_service,sname,b,ts,btrim(p_name),btrim(p_phone));
  return to_char(ts at time zone 'America/Sao_Paulo','DD/MM HH24:MI');
exception when unique_violation then raise exception 'indisponivel';
end $$;

create function public.subscribe(p_email text) returns void language sql security definer set search_path=public as
$$ insert into public.subscribers(email) values(lower(btrim(p_email))) on conflict do nothing $$;
create function public.unsubscribe(p_token uuid) returns void language sql security definer set search_path=public as
$$ delete from public.subscribers where token=p_token $$;
grant execute on function public.taken_slots(date), public.book(uuid,uuid,date,text,text,text), public.subscribe(text), public.unsubscribe(uuid) to anon, authenticated;

-- LGPD: apaga agendamentos 7 dias depois da data (todo dia, 03:00 de Brasília)
select cron.schedule('limpar-agendamentos','0 6 * * *',$$delete from public.appointments where starts_at < now() - interval '7 days'$$);

-- Dados iniciais (ajuste no painel depois)
insert into public.barbers(name) values('Rodrigo');
insert into public.hours values(0,null,null),(1,null,null),(2,'09:00','19:00'),(3,'09:00','19:00'),(4,'09:00','19:00'),(5,'09:00','19:00'),(6,'09:00','18:00');
insert into public.services(name,sort) values('Corte de cabelo',1),('Corte em degradê',2),('Corte com navalha',3),('Corte com tesoura',4),('Corte militar',5),('Corte infantil',6),('Corte personalizado',7),('Barba',8),('Barba com navalha',9),('Barbear com toalha quente',10),('Cabelo e barba',11),('Depilação com cera',12),('Raspar a cabeça',13);
insert into public.plans(name,price_cents,details) values('Pacote de cortes',11000,'Válido de terça a quinta.');

-- DEPOIS de criar seu usuário em Authentication > Users, torne-o admin (troque o e-mail):
-- insert into public.admins(user_id) select id from auth.users where email='SEU@EMAIL.COM';
