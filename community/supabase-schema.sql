-- PakTV Ghar community backend, v1
-- Run once in the SQL editor of a Supabase project you control.
-- IMPORTANT: Never expose the service_role key, SQL admin roles, or contact records.
create extension if not exists pgcrypto;
create table if not exists public.community_messages (
  id bigint generated always as identity primary key,
  topic text not null check (topic in ('general','dramas','movies','comedy','politics','youtubers')),
  author_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 22),
  body text not null check (char_length(body) between 2 and 450),
  status text not null default 'visible' check (status in ('visible','hidden','removed')),
  created_at timestamptz not null default now()
);
create index if not exists pgh_chat_recent on public.community_messages (topic,created_at desc);
create table if not exists public.community_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  message_id bigint not null references public.community_messages(id) on delete cascade,
  category text not null check (category in ('racism','bullying','namecalling','spam','unsafe','other')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique(reporter_id,message_id)
);
create table if not exists public.community_submissions (
  id bigint generated always as identity primary key,
  submitter_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('contact','report','moderator')),
  nickname text not null default '',
  email text not null default '',
  subject text not null,
  details text not null,
  related_url text not null default '',
  status text not null default 'new' check (status in ('new','reviewing','resolved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists pgh_submission_recent on public.community_submissions (created_at desc);
create table if not exists public.community_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('moderator','owner')),
  created_at timestamptz not null default now()
);
create table if not exists public.community_blocked_terms (
  phrase text primary key check (char_length(phrase) between 3 and 60)
);
-- Edit these rules as community feedback develops; client-side checks are only advisory.
insert into public.community_blocked_terms(phrase) values
('idiot'),('moron'),('stupid'),('shutup'),('loser'),('dumbass'),
('fuckyou'),('bastard'),('kill yourself'),('killyourself'),
('gobacktoyourcountry'),('hateall'),('fucking'),('retard'),
('nigger'),('nigga'),('chink'),('spic'),('kafir'),
('harami'),('kutte'),('kutta'),('kamina')
on conflict do nothing;
create table if not exists public.community_visitor_tokens (
  visited_on date not null,
  visit_digest text not null,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  primary key (visited_on,visit_digest)
);
create index if not exists pgh_visit_tokens_day on public.community_visitor_tokens (visited_on);
create table if not exists public.community_visit_totals (
  visited_on date not null,
  country_code text not null check(country_code ~ '^[A-Z]{2}$'),
  visits integer not null default 0 check (visits>=0),
  primary key(visited_on,country_code)
);
alter table public.community_messages enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_submissions enable row level security;
alter table public.community_moderators enable row level security;
alter table public.community_blocked_terms enable row level security;
alter table public.community_visitor_tokens enable row level security;
alter table public.community_visit_totals enable row level security;
-- Direct inserts are forbidden. All mutations go through validated RPC functions.
revoke all on public.community_messages,public.community_reports,
  public.community_submissions,public.community_moderators,
  public.community_blocked_terms,public.community_visitor_tokens,
  public.community_visit_totals from anon,authenticated;
-- No direct SELECT on the chat table: it contains a private guest UUID.
-- Browser callers read only safe, public columns through pgh_public_messages.
create policy pgh_visible_messages on public.community_messages for select to anon,authenticated
  using(status='visible');
create or replace function public.pgh_public_messages(p_topic text,p_limit integer default 75)
returns table(id bigint,topic text,nickname text,body text,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $
begin
 if p_topic not in ('general','dramas','movies','comedy','politics','youtubers') then
   raise exception 'Invalid discussion room'; end if;
 return query select m.id,m.topic,m.nickname,m.body,m.created_at
   from public.community_messages m where m.topic=p_topic and m.status='visible'
   order by m.created_at desc limit least(greatest(coalesce(p_limit,75),1),75);
end;
$;
revoke all on function public.pgh_public_messages(text,integer) from public,anon,authenticated;
grant execute on function public.pgh_public_messages(text,integer) to anon,authenticated;
-- Moderators get access via a narrowly scoped RPC; never expose private contact data.
create or replace function public.pgh_moderator()
returns boolean language sql stable security definer set search_path=''
as $$select exists(select 1 from public.community_moderators where user_id=auth.uid())$$;
revoke all on function public.pgh_moderator() from public;
grant execute on function public.pgh_moderator() to authenticated;
create or replace function public.pgh_safe_text(input_text text)
returns boolean language plpgsql stable security definer set search_path=''
as $$
declare
  flat text; phrase text; words text; phrase_words text;
begin
  if input_text is null or length(btrim(input_text)) < 2 then return false; end if;
  flat := regexp_replace(lower(input_text),'[^a-z0-9]+','','g');
  words := ' ' || btrim(regexp_replace(lower(input_text),'[^a-z0-9]+',' ','g')) || ' ';
  if length(flat)<2 then return false; end if;
  if input_text ~* '(https?://|www\.|@[a-z0-9_]{3,}|\m[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\M)'
    then return false; end if;
  if input_text ~ '\m[0-9]{8,}\M' then return false; end if;
  for phrase in select lower(t.phrase) from public.community_blocked_terms t loop
    phrase_words := ' ' || btrim(regexp_replace(phrase,'[^a-z0-9]+',' ','g')) || ' ';
    if position(phrase_words in words)>0 then return false; end if;
    -- Catch long obfuscated slurs (e.g. separated by punctuation), but never
    -- match short slurs inside innocent words like "Pakistani".
    if length(regexp_replace(phrase,'[^a-z0-9]+','','g'))>=7
      and position(regexp_replace(phrase,'[^a-z0-9]+','','g') in flat)>0
      then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.pgh_safe_text(text) from public;
grant execute on function public.pgh_safe_text(text) to authenticated;
create or replace function public.pgh_post_message(p_topic text,p_nickname text,p_body text)
returns bigint language plpgsql security definer set search_path=''
as $$
declare new_id bigint; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Anonymous guest session required'; end if;
  if p_topic not in ('general','dramas','movies','comedy','politics','youtubers') then
    raise exception 'Invalid discussion room'; end if;
  p_nickname:=btrim(coalesce(p_nickname,''));
  p_body:=btrim(coalesce(p_body,''));
  if length(p_nickname) not between 2 and 22 or length(p_body) not between 2 and 450
    or not public.pgh_safe_text(p_nickname) or not public.pgh_safe_text(p_body)
    then raise exception 'Message or nickname did not pass the safety filter'; end if;
  -- One message per 20 seconds and at most 25 messages per day per guest.
  if exists(select 1 from public.community_messages where author_id=uid
     and created_at>now()-interval '20 seconds') then raise exception 'Please wait 20 seconds before posting again'; end if;
  if (select count(*) from public.community_messages where author_id=uid
     and created_at>now()-interval '1 day') >= 25 then raise exception 'Daily message limit reached'; end if;
  insert into public.community_messages(topic,author_id,nickname,body)
  values(p_topic,uid,p_nickname,p_body) returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.pgh_post_message(text,text,text) from public;
grant execute on function public.pgh_post_message(text,text,text) to authenticated;
create or replace function public.pgh_report_message(p_message_id bigint,p_category text,p_note text default '')
returns void language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); report_count integer;
begin
  if uid is null then raise exception 'Guest session required'; end if;
  if p_category not in ('racism','bullying','namecalling','spam','unsafe','other')
    or length(coalesce(p_note,''))>500 then raise exception 'Invalid report'; end if;
  if not exists(select 1 from public.community_messages where id=p_message_id and status='visible') then
    raise exception 'Message no longer available'; end if;
  if (select count(*) from public.community_reports where reporter_id=uid
      and created_at>now()-interval '1 day') >= 10 then raise exception 'Report limit reached'; end if;
  insert into public.community_reports(reporter_id,message_id,category,note)
  values(uid,p_message_id,p_category,left(coalesce(p_note,''),500));
  select count(distinct reporter_id) into report_count
    from public.community_reports where message_id=p_message_id;
  if report_count>=3 then update public.community_messages set status='hidden'
    where id=p_message_id and status='visible'; end if;
exception when unique_violation then raise exception 'You already reported this message';
end;
$$;
revoke all on function public.pgh_report_message(bigint,text,text) from public;
grant execute on function public.pgh_report_message(bigint,text,text) to authenticated;
create or replace function public.pgh_submit(
 p_kind text,p_subject text,p_details text,p_email text default '',p_nickname text default '',p_related_url text default ''
)
returns bigint language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); new_id bigint;
begin
 if uid is null then raise exception 'Guest session required'; end if;
 if p_kind not in ('contact','report','moderator')
   or length(btrim(coalesce(p_subject,''))) not between 5 and 120
   or length(btrim(coalesce(p_details,''))) not between 20 and 2500
   or length(coalesce(p_nickname,''))>50 or length(coalesce(p_related_url,''))>350
   or length(coalesce(p_email,''))>200
 then raise exception 'Please check your form fields'; end if;
 if coalesce(p_email,'')<>'' and p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
   raise exception 'Invalid contact email'; end if;
 if p_kind='moderator' and p_email='' then
   raise exception 'Moderator applications require a contact email'; end if;
 if p_related_url<>'' and p_related_url !~* '^https://[^[:space:]]+$' then
   raise exception 'Use an HTTPS link for the report'; end if;
 if (select count(*) from public.community_submissions where submitter_id=uid
    and created_at>now()-interval '1 day')>=3 then raise exception 'Submission limit reached; try again tomorrow'; end if;
 insert into public.community_submissions(submitter_id,kind,subject,details,email,nickname,related_url)
 values(uid,p_kind,btrim(p_subject),btrim(p_details),btrim(coalesce(p_email,'')),
   btrim(coalesce(p_nickname,'')),btrim(coalesce(p_related_url,''))) returning id into new_id;
 return new_id;
end;
$$;
revoke all on function public.pgh_submit(text,text,text,text,text,text) from public;
grant execute on function public.pgh_submit(text,text,text,text,text,text) to authenticated;
-- Contact, reports and moderator applications are ONLY visible to site owners.
-- For the owner account: sign in with a verified email, then run as project
-- administrator:
-- INSERT INTO public.community_moderators(user_id,role)
-- VALUES ('YOUR-AUTH-USER-UUID','owner') ON CONFLICT(user_id)
-- DO UPDATE SET role='owner';
create or replace function public.pgh_owner()
returns boolean language sql stable security definer set search_path=''
as $select exists(select 1 from public.community_moderators
 where user_id=auth.uid() and role='owner')$;
revoke all on function public.pgh_owner() from public,anon,authenticated;
grant execute on function public.pgh_owner() to authenticated;
create or replace function public.pgh_private_inbox()
returns table(id bigint,kind text,nickname text,email text,subject text,
 details text,related_url text,status text,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $
begin
 if not public.pgh_owner() then raise exception 'Owner access required'; end if;
 return query select s.id,s.kind,s.nickname,s.email,s.subject,s.details,
   s.related_url,s.status,s.created_at
 from public.community_submissions s
 order by case when s.status='new' then 0 else 1 end,s.created_at desc
 limit 250;
end;
$;
revoke all on function public.pgh_private_inbox() from public,anon,authenticated;
grant execute on function public.pgh_private_inbox() to authenticated;
create or replace function public.pgh_resolve_submission(p_id bigint,p_status text)
returns void language plpgsql security definer set search_path=''
as $
begin
 if not public.pgh_owner() then raise exception 'Owner access required'; end if;
 if p_status not in ('new','reviewing','resolved','rejected') then
   raise exception 'Invalid status'; end if;
 update public.community_submissions set status=p_status where id=p_id;
end;
$;
revoke all on function public.pgh_resolve_submission(bigint,text) from public,anon,authenticated;
grant execute on function public.pgh_resolve_submission(bigint,text) to authenticated;

-- Moderator tools never allow applicants to grant themselves access.
create or replace function public.pgh_moderate(p_message_id bigint,p_action text)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not public.pgh_moderator() then raise exception 'Moderator access required'; end if;
 if p_action not in ('hide','restore','remove') then raise exception 'Invalid moderation action'; end if;
 update public.community_messages set status=case p_action
    when 'hide' then 'hidden' when 'restore' then 'visible' else 'removed' end
    where id=p_message_id;
end;
$$;
revoke all on function public.pgh_moderate(bigint,text) from public;
grant execute on function public.pgh_moderate(bigint,text) to authenticated;
create or replace function public.pgh_review_queue()
returns table(id bigint,topic text,nickname text,body text,status text,created_at timestamptz,report_count bigint)
language plpgsql stable security definer set search_path=''
as $$
begin
 if not public.pgh_moderator() then raise exception 'Moderator access required'; end if;
 return query select m.id,m.topic,m.nickname,m.body,m.status,m.created_at,
    (select count(*) from public.community_reports r where r.message_id=m.id)
 from public.community_messages m
 where m.status<>'visible' or exists(select 1 from public.community_reports r where r.message_id=m.id)
 order by m.created_at desc limit 200;
end;
$$;
revoke all on function public.pgh_review_queue() from public;
grant execute on function public.pgh_review_queue() to authenticated;
-- Private submissions and moderation reports are accessible ONLY to project owners.
create or replace function public.pgh_owner()
returns boolean language sql stable security definer set search_path=''
as $select exists(select 1 from public.community_moderators where user_id=auth.uid() and role='owner')$;
revoke all on function public.pgh_owner() from public;
grant execute on function public.pgh_owner() to authenticated;
create or replace function public.pgh_review_submissions()
returns table(id bigint,kind text,nickname text,email text,subject text,details text,related_url text,status text,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $
begin
 if not public.pgh_owner() then raise exception 'Site-owner access required'; end if;
 return query select s.id,s.kind,s.nickname,s.email,s.subject,s.details,s.related_url,s.status,s.created_at
 from public.community_submissions s order by s.created_at desc limit 150;
end;
$;
revoke all on function public.pgh_review_submissions() from public;
grant execute on function public.pgh_review_submissions() to authenticated;
create or replace function public.pgh_review_message_reports()
returns table(id bigint,message_id bigint,category text,note text,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $
begin
 if not public.pgh_moderator() then raise exception 'Moderator access required'; end if;
 return query select r.id,r.message_id,r.category,r.note,r.created_at
 from public.community_reports r order by r.created_at desc limit 100;
end;
$;
revoke all on function public.pgh_review_message_reports() from public;
grant execute on function public.pgh_review_message_reports() to authenticated;
create or replace function public.pgh_decide_submission(p_id bigint,p_status text)
returns void language plpgsql security definer set search_path=''
as $
begin
 if not public.pgh_owner() then raise exception 'Owner access required'; end if;
 if p_status not in ('reviewing','resolved','rejected') then raise exception 'Invalid review status'; end if;
 update public.community_submissions set status=p_status where id=p_id;
end;
$;
revoke all on function public.pgh_decide_submission(bigint,text) from public;
grant execute on function public.pgh_decide_submission(bigint,text) to authenticated;
-- Public aggregate counts without raw visitor identifiers.
create or replace function public.pgh_visit_summary()
returns jsonb language sql stable security definer set search_path=''
as $$
select jsonb_build_object(
 'visits',(select coalesce(sum(visits),0) from public.community_visit_totals),
 'last30',(select coalesce(sum(visits),0) from public.community_visit_totals where visited_on >= current_date-29),
 'countries',(select coalesce(jsonb_agg(jsonb_build_object('country',country_code,'visits',v)), '[]'::jsonb)
   from (select country_code,sum(visits) v from public.community_visit_totals
     where visited_on>=current_date-29 group by country_code order by v desc limit 8) s)
);
$$;
revoke all on function public.pgh_visit_summary() from public;
grant execute on function public.pgh_visit_summary() to anon,authenticated;
-- Only the server-side Edge Function can record visits, never the browser.
create or replace function public.pgh_record_visit(p_digest text,p_country text)
returns void language plpgsql security definer set search_path=''
as $$
declare changed integer;
begin
 if current_user <> 'service_role' and auth.role()<>'service_role' then
   raise exception 'Server-only'; end if;
 -- Keep short-lived per-visitor digests for no more than one week.
 delete from public.community_visitor_tokens where visited_on < current_date-7;
 if p_digest !~ '^[0-9a-f]{64}
 if p_country !~ '^[A-Z]{2}$' then p_country:='ZZ'; end if;
 insert into public.community_visitor_tokens(visited_on,visit_digest,country_code)
 values(current_date,p_digest,p_country) on conflict do nothing;
 get diagnostics changed=row_count;
 if changed>0 then
   insert into public.community_visit_totals(visited_on,country_code,visits)
   values(current_date,p_country,1)
   on conflict(visited_on,country_code)
   do update set visits=public.community_visit_totals.visits+1;
 end if;
end;
$$;
revoke all on function public.pgh_record_visit(text,text) from public;
grant execute on function public.pgh_record_visit(text,text) to service_role;
-- Optional retention job for chat and private reports (requires pg_cron,
-- an owner-approved deletion schedule and reviewing legal obligations first):
-- DELETE FROM public.community_messages WHERE created_at < now()-interval '90 days';
-- DELETE FROM public.community_submissions WHERE created_at < now()-interval '365 days'
--   AND status IN ('resolved','rejected');
-- Visitor deduplication tokens are automatically cleaned after 7 days as new
-- visits arrive. This is distinct from long-term anonymised country totals.
 then raise exception 'Invalid visit digest'; end if;
 if p_country !~ '^[A-Z]{2}$' then p_country:='ZZ'; end if;
 insert into public.community_visitor_tokens(visited_on,visit_digest,country_code)
 values(current_date,p_digest,p_country) on conflict do nothing;
 get diagnostics changed=row_count;
 if changed>0 then
   insert into public.community_visit_totals(visited_on,country_code,visits)
   values(current_date,p_country,1)
   on conflict(visited_on,country_code)
   do update set visits=public.community_visit_totals.visits+1;
 end if;
end;
$$;
revoke all on function public.pgh_record_visit(text,text) from public;
grant execute on function public.pgh_record_visit(text,text) to service_role;
-- Cleanup can be run daily using pg_cron if supported; this command is safe manually.
-- delete from public.community_visitor_tokens where visited_on<current_date-3;
-- delete from public.community_messages where created_at<now()-interval '90 days';
