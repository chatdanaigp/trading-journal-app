-- Create a table for Journal Entries
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  mood text check (mood in ('great', 'good', 'neutral', 'bad', 'terrible')),
  tags text[] default '{}',
  trading_day date default current_date,
  followed_plan boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table journal_entries enable row level security;

create policy "Users can view their own journal entries." on journal_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own journal entries." on journal_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own journal entries." on journal_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own journal entries." on journal_entries
  for delete using (auth.uid() = user_id);
