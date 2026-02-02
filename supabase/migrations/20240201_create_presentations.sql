-- Create presentations table
create table public.presentations (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Presentation',
  slug text unique,
  search_query text, -- The prompt used to generate
  theme text default 'modern',
  content jsonb default '[]'::jsonb, -- Array of slides
  share_enabled_at timestamp with time zone,
  public_views integer default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint presentations_pkey primary key (id)
);

-- Enable RLS
alter table public.presentations enable row level security;

-- Policies
create policy "Users can view their own presentations"
  on public.presentations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own presentations"
  on public.presentations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presentations"
  on public.presentations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presentations"
  on public.presentations for delete
  using (auth.uid() = user_id);

create policy "Public can view presentations via slug if not expired"
  on public.presentations for select
  using (slug is not null);  -- Application logic will handle 7-day expiry check to redirect

-- Triggers for updated_at
create trigger handle_updated_at before update on public.presentations
  for each row execute procedure moddatetime (updated_at);
