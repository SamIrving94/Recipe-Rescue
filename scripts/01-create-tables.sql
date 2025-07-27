-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Restaurant visits
create table public.restaurant_visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  restaurant_name text not null,
  location text,
  visit_date date not null,
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5),
  notes text,
  menu_photo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Dishes from restaurant visits
create table public.dishes (
  id uuid default gen_random_uuid() primary key,
  visit_id uuid references public.restaurant_visits(id) on delete cascade not null,
  name text not null,
  description text,
  price text,
  category text,
  ordered boolean default false,
  rating integer check (rating >= 1 and rating <= 5),
  notes text,
  want_to_recreate boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Recipes discovered/saved
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  source_url text,
  source_type text check (source_type in ('web', 'photo', 'ai', 'restaurant')),
  image_url text,
  ingredients text[],
  instructions text[],
  cook_time text,
  servings text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cuisine_type text,
  linked_dish_id uuid references public.dishes(id),
  saved_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_restaurant_visits_user_id on public.restaurant_visits(user_id);
create index idx_restaurant_visits_visit_date on public.restaurant_visits(visit_date desc);
create index idx_dishes_visit_id on public.dishes(visit_id);
create index idx_dishes_ordered on public.dishes(ordered) where ordered = true;
create index idx_recipes_user_id on public.recipes(user_id);
create index idx_recipes_linked_dish_id on public.recipes(linked_dish_id);
create index idx_recipes_saved_at on public.recipes(saved_at desc);
