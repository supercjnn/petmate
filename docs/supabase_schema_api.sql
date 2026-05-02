-- PetMate Supabase 数据库Schema（API模式）
-- 适用于服务端API访问，RLS宽松策略

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  nickname TEXT DEFAULT '铲屎官',
  current_day INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cat_name TEXT,
  cat_birth_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_amount INTEGER,
  payment_method TEXT,
  settings JSONB DEFAULT '{"reminderEnabled": true, "reminderTime": "09:00", "reminderMethod": "browser"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'observation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日记录表
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_notes_user_day ON notes(user_id, day_number);
CREATE INDEX IF NOT EXISTS idx_daily_records_user ON daily_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- RLS策略：API模式下允许所有操作（使用anon key）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 允许所有通过anon key的访问（适用于服务端API）
CREATE POLICY "允许API全部访问" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许API全部访问" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许API全部访问" ON daily_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "允许API全部访问" ON payments FOR ALL USING (true) WITH CHECK (true);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();