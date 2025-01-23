-- Create the rental_config table
create table if not exists rental_config (
  id text primary key,
  packages jsonb not null,
  add_ons jsonb not null,
  key_features jsonb not null,
  addon_groups jsonb not null,
  updated_at timestamp with time zone not null default now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rental_config_updated_at ON rental_config(updated_at);

-- Set up row level security
alter table public.rental_config enable row level security;

-- Create policy to allow anyone to read
create policy "Allow public read access"
  on public.rental_config
  for select
  using (true);

-- Create policy to allow only authenticated users to update
create policy "Allow authenticated users to update"
  on public.rental_config
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create policy to allow only authenticated users to insert
create policy "Allow authenticated users to insert"
  on public.rental_config
  for insert
  with check (auth.role() = 'authenticated'); 