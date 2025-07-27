-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.restaurant_visits enable row level security;
alter table public.dishes enable row level security;
alter table public.recipes enable row level security;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Restaurant visits policies
create policy "Users can view own visits" on public.restaurant_visits
  for select using (auth.uid() = user_id);

create policy "Users can insert own visits" on public.restaurant_visits
  for insert with check (auth.uid() = user_id);

create policy "Users can update own visits" on public.restaurant_visits
  for update using (auth.uid() = user_id);

create policy "Users can delete own visits" on public.restaurant_visits
  for delete using (auth.uid() = user_id);

-- Dishes policies
create policy "Users can view dishes from own visits" on public.dishes
  for select using (
    exists (
      select 1 from public.restaurant_visits rv
      where rv.id = dishes.visit_id and rv.user_id = auth.uid()
    )
  );

create policy "Users can insert dishes to own visits" on public.dishes
  for insert with check (
    exists (
      select 1 from public.restaurant_visits rv
      where rv.id = dishes.visit_id and rv.user_id = auth.uid()
    )
  );

create policy "Users can update dishes from own visits" on public.dishes
  for update using (
    exists (
      select 1 from public.restaurant_visits rv
      where rv.id = dishes.visit_id and rv.user_id = auth.uid()
    )
  );

create policy "Users can delete dishes from own visits" on public.dishes
  for delete using (
    exists (
      select 1 from public.restaurant_visits rv
      where rv.id = dishes.visit_id and rv.user_id = auth.uid()
    )
  );

-- Recipes policies
create policy "Users can view own recipes" on public.recipes
  for select using (auth.uid() = user_id);

create policy "Users can insert own recipes" on public.recipes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recipes" on public.recipes
  for update using (auth.uid() = user_id);

create policy "Users can delete own recipes" on public.recipes
  for delete using (auth.uid() = user_id);
