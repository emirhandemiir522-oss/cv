-- Kullanıcılar tablosunu oluştur (eğer yoksa)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  subscription_status text default 'trialing',
  trial_started_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS'i aktif et
alter table public.users enable row level security;

-- Okuma izni (Kendi verisini görebilsin)
create policy "Users can view own profile" 
on public.users for select 
to authenticated 
using (auth.uid() = id);

-- Güncelleme izni (Kendi verisini güncelleyebilsin)
create policy "Users can update own profile" 
on public.users for update 
to authenticated 
using (auth.uid() = id);

-- EKLEME İZNİ (Sorunu çözen kısım burası)
-- Kullanıcı kendi ID'si ile kayıt ekleyebilir
create policy "Users can insert own profile" 
on public.users for insert 
to authenticated 
with check (auth.uid() = id);
