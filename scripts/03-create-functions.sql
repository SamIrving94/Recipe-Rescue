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

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_visits BIGINT,
  total_dishes BIGINT,
  average_rating DECIMAL(3,2),
  favorite_restaurant TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT rv.id)::BIGINT as total_visits,
    COUNT(d.id)::BIGINT as total_dishes,
    COALESCE(AVG(d.rating), 0)::DECIMAL(3,2) as average_rating,
    (
      SELECT rv2.restaurant_name 
      FROM restaurant_visits rv2 
      WHERE rv2.user_id = user_uuid 
      GROUP BY rv2.restaurant_name 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as favorite_restaurant
  FROM restaurant_visits rv
  LEFT JOIN dishes d ON rv.id = d.visit_id
  WHERE rv.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search visits and dishes
CREATE OR REPLACE FUNCTION search_visits(user_uuid UUID, search_query TEXT)
RETURNS TABLE (
  id UUID,
  restaurant_name TEXT,
  location TEXT,
  visit_date DATE,
  menu_photo_url TEXT,
  notes TEXT,
  overall_rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    rv.id,
    rv.restaurant_name,
    rv.location,
    rv.visit_date,
    rv.menu_photo_url,
    rv.notes,
    rv.overall_rating,
    rv.created_at
  FROM restaurant_visits rv
  LEFT JOIN dishes d ON rv.id = d.visit_id
  WHERE rv.user_id = user_uuid
    AND (
      rv.restaurant_name ILIKE '%' || search_query || '%'
      OR rv.location ILIKE '%' || search_query || '%'
      OR d.name ILIKE '%' || search_query || '%'
      OR d.description ILIKE '%' || search_query || '%'
    )
  ORDER BY rv.visit_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent visits with dish count
CREATE OR REPLACE FUNCTION get_recent_visits(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  restaurant_name TEXT,
  location TEXT,
  visit_date DATE,
  menu_photo_url TEXT,
  notes TEXT,
  overall_rating DECIMAL(3,2),
  dish_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rv.id,
    rv.restaurant_name,
    rv.location,
    rv.visit_date,
    rv.menu_photo_url,
    rv.notes,
    rv.overall_rating,
    COUNT(d.id)::BIGINT as dish_count,
    rv.created_at
  FROM restaurant_visits rv
  LEFT JOIN dishes d ON rv.id = d.visit_id
  WHERE rv.user_id = user_uuid
  GROUP BY rv.id, rv.restaurant_name, rv.location, rv.visit_date, rv.menu_photo_url, rv.notes, rv.overall_rating, rv.created_at
  ORDER BY rv.visit_date DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dishes by rating range
CREATE OR REPLACE FUNCTION get_dishes_by_rating(user_uuid UUID, min_rating DECIMAL(3,2) DEFAULT 4.0)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  dish_rating DECIMAL(3,2),
  restaurant_name TEXT,
  visit_date DATE,
  want_to_recreate BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as dish_id,
    d.name as dish_name,
    d.rating as dish_rating,
    rv.restaurant_name,
    rv.visit_date,
    d.want_to_recreate
  FROM dishes d
  JOIN restaurant_visits rv ON d.visit_id = rv.id
  WHERE rv.user_id = user_uuid
    AND d.rating >= min_rating
    AND d.ordered = true
  ORDER BY d.rating DESC, rv.visit_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dishes marked for recreation
CREATE OR REPLACE FUNCTION get_dishes_for_recreation(user_uuid UUID)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  dish_description TEXT,
  dish_rating DECIMAL(3,2),
  restaurant_name TEXT,
  visit_date DATE,
  has_recipe BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as dish_id,
    d.name as dish_name,
    d.description as dish_description,
    d.rating as dish_rating,
    rv.restaurant_name,
    rv.visit_date,
    EXISTS(SELECT 1 FROM recipes r WHERE r.linked_dish_id = d.id) as has_recipe
  FROM dishes d
  JOIN restaurant_visits rv ON d.visit_id = rv.id
  WHERE rv.user_id = user_uuid
    AND d.want_to_recreate = true
    AND d.ordered = true
  ORDER BY rv.visit_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS TABLE (
  deleted_dishes BIGINT,
  deleted_recipes BIGINT
) AS $$
DECLARE
  dishes_deleted BIGINT := 0;
  recipes_deleted BIGINT := 0;
BEGIN
  -- Delete dishes from deleted visits
  DELETE FROM dishes 
  WHERE visit_id NOT IN (SELECT id FROM restaurant_visits);
  
  GET DIAGNOSTICS dishes_deleted = ROW_COUNT;
  
  -- Delete recipes from deleted dishes
  DELETE FROM recipes 
  WHERE linked_dish_id NOT IN (SELECT id FROM dishes);
  
  GET DIAGNOSTICS recipes_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT dishes_deleted, recipes_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
