-- Create storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Policy to allow authenticated uploads
create policy "Authenticated users can upload resumes"
on storage.objects for insert
with check (
  bucket_id = 'resumes' and
  auth.role() = 'authenticated'
);

-- Policy to allow public read access
create policy "Public can view resumes"
on storage.objects for select
using ( bucket_id = 'resumes' );
