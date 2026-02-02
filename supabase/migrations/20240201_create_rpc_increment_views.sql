-- Function to increment presentation views
create or replace function public.increment_presentation_views(row_id uuid)
returns void as $$
begin
  update public.presentations
  set public_views = public_views + 1
  where id = row_id;
end;
$$ language plpgsql security definer;
