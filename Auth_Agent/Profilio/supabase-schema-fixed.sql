-- Create profiles table
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create social_links table
create table public.social_links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  username text not null,
  url text not null,
  display_name text,
  custom_icon_url text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_username_idx on public.profiles(username);
create index social_links_profile_id_idx on public.social_links(profile_id);

-- Enable RLS on tables
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- RLS Policies for social_links
create policy "Social links are viewable by everyone" on public.social_links
  for select using (true);

create policy "Users can insert their own social links" on public.social_links
  for insert with check (
    exists (
      select 1 from public.profiles 
      where profiles.id = social_links.profile_id 
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can update their own social links" on public.social_links
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = social_links.profile_id 
      and profiles.user_id = auth.uid()
    )
  );

create policy "Users can delete their own social links" on public.social_links
  for delete using (
    exists (
      select 1 from public.profiles 
      where profiles.id = social_links.profile_id 
      and profiles.user_id = auth.uid()
    )
  );

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_username text;
begin
  -- Generate a unique username from the full name or email
  generated_username := coalesce(
    new.raw_user_meta_data->>'username',
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '')) || floor(random() * 1000)::text
  );
  
  -- Ensure uniqueness by checking and incrementing if needed
  while exists (select 1 from public.profiles where username = generated_username) loop
    generated_username := generated_username || floor(random() * 100)::text;
  end loop;
  
  insert into public.profiles (user_id, username, full_name, avatar_url)
  values (
    new.id,
    generated_username,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to update updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_social_links_updated_at before update on public.social_links
  for each row execute procedure update_updated_at_column(); 