-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_restaurant_visits_updated_at before update on public.restaurant_visits
  for each row execute procedure public.update_updated_at_column();

create trigger update_dishes_updated_at before update on public.dishes
  for each row execute procedure public.update_updated_at_column();

create trigger update_recipes_updated_at before update on public.recipes
  for each row execute procedure public.update_updated_at_column();
