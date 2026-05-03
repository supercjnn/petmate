-- PetMate 数据库 Schema
-- Supabase PostgreSQL

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ 用户表 ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255),
  nickname VARCHAR(100),
  avatar_url TEXT,
  experience VARCHAR(20) CHECK (experience IN ('beginner', 'intermediate', 'experienced')),
  environment VARCHAR(20) CHECK (environment IN ('solo', 'family', 'multi_pet')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(email)
);

-- ============ 猫咪表 ============
CREATE TABLE IF NOT EXISTS cats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  breed VARCHAR(100),
  birth_date DATE,
  adopt_date DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'unknown')),
  sterilized BOOLEAN DEFAULT FALSE,
  weight DECIMAL(5,2),
  avatar_url TEXT,
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 每日记录表 ============
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cat_id UUID REFERENCES cats(id) ON DELETE SET NULL,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  completed_actions JSONB DEFAULT '[]',
  notes TEXT,
  mood VARCHAR(20) CHECK (mood IN ('great', 'good', 'okay', 'worried', 'bad')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- ============ 笔记表 ============
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cat_id UUID REFERENCES cats(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('observation', 'health', 'behavior', 'feeding', 'other')) DEFAULT 'other',
  tags JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 成就表 ============
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, achievement_id)
);

-- ============ 支付表 ============
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) CHECK (product_type IN ('premium', 'consultation', 'course', 'subscription')) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method VARCHAR(20) CHECK (payment_method IN ('wechat', 'alipay')),
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 分享链接表 ============
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) CHECK (content_type IN ('progress', 'achievement', 'card', 'diary')) NOT NULL,
  content JSONB NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ 索引 ============
CREATE INDEX IF NOT EXISTS idx_cats_user_id ON cats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_id ON daily_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);

-- ============ RLS 策略 ============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own cats" ON cats FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own cats" ON cats FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own cats" ON cats FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own cats" ON cats FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own records" ON daily_records FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own records" ON daily_records FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own records" ON daily_records FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own shares" ON share_links FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own shares" ON share_links FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ============ 触发器：自动更新 updated_at ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cats_updated_at BEFORE UPDATE ON cats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();