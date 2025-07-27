-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Restaurant visits policies
CREATE POLICY "Users can view their own visits" ON restaurant_visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits" ON restaurant_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits" ON restaurant_visits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visits" ON restaurant_visits
  FOR DELETE USING (auth.uid() = user_id);

-- Dishes policies
CREATE POLICY "Users can view dishes from their visits" ON dishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurant_visits 
      WHERE restaurant_visits.id = dishes.visit_id 
      AND restaurant_visits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert dishes for their visits" ON dishes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_visits 
      WHERE restaurant_visits.id = dishes.visit_id 
      AND restaurant_visits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update dishes from their visits" ON dishes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurant_visits 
      WHERE restaurant_visits.id = dishes.visit_id 
      AND restaurant_visits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete dishes from their visits" ON dishes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurant_visits 
      WHERE restaurant_visits.id = dishes.visit_id 
      AND restaurant_visits.user_id = auth.uid()
    )
  );

-- Recipes policies
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
