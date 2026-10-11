-- Food4Seasons : base partagée entre l'iPhone et le Mac (décision du 2026-10-11, 06).
-- À coller une fois dans Supabase > SQL Editor, puis « Run ».
-- Chaque ligne est un élément d'une table du site (recette, semaine, entrée du congélateur, ingrédient),
-- rangé par utilisateur : personne d'autre que son propriétaire ne peut le lire ni l'écrire.

create table if not exists public.elements (
  proprietaire uuid not null default auth.uid() references auth.users (id) on delete cascade,
  table_nom text not null check (table_nom in ('ingredients', 'recettes', 'semaines', 'congelateur')),
  cle text not null,
  valeur jsonb,                       -- null quand l'élément est supprimé
  supprime boolean not null default false,
  modifie_le timestamptz not null default now(),
  primary key (proprietaire, table_nom, cle)
);

create index if not exists elements_modifie_le on public.elements (proprietaire, modifie_le);

-- L'heure de modification est toujours celle du serveur, pour que la synchro ne dépende pas de l'horloge de l'appareil.
create or replace function public.elements_horodater() returns trigger language plpgsql as $$
begin
  new.modifie_le := clock_timestamp();
  return new;
end $$;

drop trigger if exists elements_horodater on public.elements;
create trigger elements_horodater before insert or update on public.elements
  for each row execute function public.elements_horodater();

alter table public.elements enable row level security;

drop policy if exists "chacun ses donnees" on public.elements;
create policy "chacun ses donnees" on public.elements
  for all to authenticated
  using (proprietaire = auth.uid())
  with check (proprietaire = auth.uid());
