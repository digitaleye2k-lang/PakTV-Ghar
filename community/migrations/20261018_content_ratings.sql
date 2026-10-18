-- Public movie/show ratings: real viewer votes only. No fictitious vote rows.
create table if not exists public.pgh_content_ratings (
    id bigint generated always as identity primary key,
    kind text not null check (kind in ('show','movie')),
    item text not null check (item ~ '^[A-Za-z0-9_-]{1,96}$'),
    user_id uuid not null references auth.users(id) on delete cascade,
    stars smallint not null check (stars between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint pgh_content_ratings_one_per_user unique(kind,item,user_id)
);
create index if not exists pgh_content_ratings_item_idx on public.pgh_content_ratings(kind,item);
create index if not exists pgh_content_ratings_user_created_idx on public.pgh_content_ratings(user_id,created_at desc);
alter table public.pgh_content_ratings enable row level security;
revoke all on public.pgh_content_ratings from public,anon,authenticated;

create or replace function public.pgh_rating_summary(p_items jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare result jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) > 100 then
    raise exception 'Invalid rating lookup';
  end if;
  if exists(
    select 1 from jsonb_array_elements(p_items) as row
    where row->>'kind' not in ('show','movie')
       or coalesce(row->>'item','') !~ '^[A-Za-z0-9_-]{1,96}$'
  ) then
    raise exception 'Invalid rating reference';
  end if;
  with subjects as (
    select distinct row->>'kind' as kind, row->>'item' as item
    from jsonb_array_elements(p_items) as row
  ), counted as (
    select s.kind,s.item,count(r.id)::int as votes,
      round(avg(r.stars)::numeric,1) as average,
      max(case when r.user_id=auth.uid() then r.stars end) as yours
    from subjects s
    left join public.pgh_content_ratings r on (r.kind=s.kind and r.item=s.item)
    group by s.kind,s.item
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'kind',kind,'item',item,'votes',votes,'average',average,'yours',yours
  )), '[]'::jsonb) into result from counted;
  return result;
end
$$;

create or replace function public.pgh_rate_content(p_kind text,p_item text,p_stars integer)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare voter uuid := auth.uid();
declare existing public.pgh_content_ratings%rowtype;
declare today_count integer;
begin
  if voter is null or auth.role() <> 'authenticated' then
    raise exception 'Guest sign-in required';
  end if;
  if p_kind not in ('show','movie')
     or coalesce(p_item,'') !~ '^[A-Za-z0-9_-]{1,96}$'
     or p_stars is null or p_stars not between 1 and 5 then
    raise exception 'Invalid rating';
  end if;
  select * into existing from public.pgh_content_ratings
    where kind=p_kind and item=p_item and user_id=voter;
  if found and existing.updated_at > now()-interval '12 seconds' then
    raise exception 'Please wait before updating this rating';
  end if;
  if not found then
    select count(*) into today_count from public.pgh_content_ratings
      where user_id=voter and created_at > now()-interval '24 hours';
    if today_count>=40 then
      raise exception 'Daily rating limit reached';
    end if;
  end if;
  insert into public.pgh_content_ratings(kind,item,user_id,stars)
    values(p_kind,p_item,voter,p_stars)
    on conflict (kind,item,user_id)
    do update set stars=excluded.stars,updated_at=now();
  return public.pgh_rating_summary(
    jsonb_build_array(jsonb_build_object('kind',p_kind,'item',p_item))
  );
end
$$;
revoke all on function public.pgh_rating_summary(jsonb),public.pgh_rate_content(text,text,integer)
 from public,anon,authenticated;
grant execute on function public.pgh_rating_summary(jsonb) to anon,authenticated;
grant execute on function public.pgh_rate_content(text,text,integer) to authenticated;
