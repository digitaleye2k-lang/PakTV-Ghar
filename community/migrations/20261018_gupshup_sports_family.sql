-- Allow two new moderated GUPSHUP rooms. No new tables or extra personal data.
alter table public.community_messages drop constraint community_messages_topic_check;
alter table public.community_messages add constraint community_messages_topic_check
 check (topic in ('general','dramas','movies','comedy','politics','youtubers','sports','family'));

create or replace function public.pgh_public_messages(p_topic text,p_limit integer default 75)
returns table(id bigint,topic text,nickname text,body text,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
 if p_topic not in ('general','dramas','movies','comedy','politics','youtubers','sports','family') then
   raise exception 'Invalid discussion room'; end if;
 return query select m.id,m.topic,m.nickname,m.body,m.created_at
   from public.community_messages m where m.topic=p_topic and m.status='visible'
   order by m.created_at desc limit least(greatest(coalesce(p_limit,75),1),75);
end;
$$;
create or replace function public.pgh_post_message(p_topic text,p_nickname text,p_body text)
returns bigint language plpgsql security definer set search_path=''
as $$
declare new_id bigint; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Anonymous guest session required'; end if;
  if p_topic not in ('general','dramas','movies','comedy','politics','youtubers','sports','family') then
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
-- Keep the existing narrow browser permissions; definer functions are not public.
revoke all on function public.pgh_public_messages(text,integer),
 public.pgh_post_message(text,text,text) from public,anon,authenticated;
grant execute on function public.pgh_public_messages(text,integer) to anon,authenticated;
grant execute on function public.pgh_post_message(text,text,text) to authenticated;
