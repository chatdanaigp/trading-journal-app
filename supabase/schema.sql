-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_public boolean default false,
  bio text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This triggers a function every time a user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create portfolios table
create table if not exists portfolios (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolios enable row level security;

create policy "Users can view their own portfolios." on portfolios
    for select using (auth.uid() = user_id);

create policy "Users can insert their own portfolios." on portfolios
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own portfolios." on portfolios
    for update using (auth.uid() = user_id);

create policy "Users can delete their own portfolios." on portfolios
    for delete using (auth.uid() = user_id);

-- Create a table for Trades
create table if not exists trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  symbol text not null,
  type text not null check (type in ('BUY', 'SELL')),
  lot_size numeric not null,
  entry_price numeric not null,
  exit_price numeric,
  profit numeric,
  notes text,
  screenshot_url text,
  strategy text,
  portfolio_id uuid references portfolios(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table trades enable row level security;

create policy "Users can view their own trades." on trades
  for select using (auth.uid() = user_id);

create policy "Admins can view all trades." on trades
  for select using ( 
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.username = 'admin'
    )
    or auth.uid() = user_id 
  );

create policy "Users can insert their own trades." on trades
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own trades." on trades
  for update using (auth.uid() = user_id);

create policy "Users can delete their own trades." on trades
  for delete using (auth.uid() = user_id);
