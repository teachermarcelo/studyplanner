-- FLUENT IMMERSION STUDY PLANNER - FULL RESET SCHEMA
-- WARNING: This will drop existing tables to fix structure errors.

-- 0. CLEAN UP
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  level TEXT DEFAULT 'A1' CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LESSONS
CREATE TABLE public.lessons (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  grammar_content TEXT,
  vocabulary TEXT[] DEFAULT '{}',
  reading_prompt TEXT,
  writing_prompt TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level, day)
);

-- 3. QUIZZES
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROGRESS
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  vocabulary_mastered TEXT[] DEFAULT '{}',
  speaking_practice_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 5. ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FLASHCARDS
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  interval INTEGER DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RLS ENABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles updateable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by system" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles deleteable by owner" ON public.profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Progress manageable by owner" ON public.progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Flashcards manageable by owner" ON public.flashcards FOR ALL USING (auth.uid() = user_id);

-- 9. TRIGGER PERFIL AUTOMÁTICO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin, level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    (NEW.email = 'marcellospropaganda@gmail.com'),
    'A1'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. DADOS INICIAIS
INSERT INTO public.lessons (id, level, day, title, description, grammar_content, vocabulary, reading_prompt, writing_prompt)
VALUES 
('a1-d1', 'A1', 1, 'Greetings & Basics', 'Introductory lesson for beginners.', 'Focus on Verb to Be.', '{"Hello", "World"}', 'Read about Alex.', 'Introduce yourself.'),
('a1-d2', 'A1', 2, 'My Family', 'Talking about family members.', 'Possessive adjectives.', '{"Mother", "Father"}', 'Family story.', 'Write about your family.'),
('a2-d1', 'A2', 1, 'Daily Routines', 'Talking about your day.', 'Present Simple frequency adverbs.', '{"Always", "Never"}', 'My morning routine.', 'Describe your day.'),
('b1-d1', 'B1', 1, 'Travel Dreams', 'Discussing destinations.', 'Present Perfect for experience.', '{"Passport", "Flight"}', 'A trip to London.', 'Where have you traveled?'),
('b2-d1', 'B2', 1, 'Environmental Issues', 'Advanced discussion on nature.', 'Passive voice and conditionals.', '{"Pollution", "Crisis"}', 'Climate change report.', 'Debate about green energy.')
ON CONFLICT (id) DO NOTHING;
