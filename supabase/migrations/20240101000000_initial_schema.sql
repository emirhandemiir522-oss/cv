-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (Stripe info)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'trialing', -- trialing, active, canceled, expired
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table (Base resumes)
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  base_resume_json JSONB NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Posts table (Scraped jobs)
CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  job_url TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  job_data JSONB, -- Full scraped data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Versions table (Optimized resumes)
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_post_id UUID REFERENCES job_posts(id) ON DELETE SET NULL,
  version_name TEXT,
  optimized_resume_json JSONB NOT NULL,
  ats_score INTEGER,
  analysis_json JSONB, -- Matched/missing keywords
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Links table (Public access)
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_version_id UUID REFERENCES resume_versions(id) ON DELETE CASCADE,
  public_path TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX idx_shared_links_path ON shared_links(public_path);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Resumes Policies
CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);

-- Job Posts Policies
CREATE POLICY "Users can view own job posts" ON job_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own job posts" ON job_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Resume Versions Policies
CREATE POLICY "Users can view own versions" ON resume_versions FOR SELECT USING (
  resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own versions" ON resume_versions FOR INSERT WITH CHECK (
  resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
);

-- Shared Links Policies
CREATE POLICY "Public links are readable" ON shared_links FOR SELECT USING (true);
CREATE POLICY "Users can create links" ON shared_links FOR INSERT WITH CHECK (
  resume_version_id IN (
    SELECT rv.id FROM resume_versions rv
    JOIN resumes r ON rv.resume_id = r.id
    WHERE r.user_id = auth.uid()
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (new.id, 'trialing');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
