-- PetMate Supabase 数据库Schema

-- 用户表
CREATE TABLE users (
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
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'observation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日记录表
CREATE TABLE daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);

-- 支付记录表
CREATE TABLE payments (
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
CREATE INDEX idx_notes_user_day ON notes(user_id, day_number);
CREATE INDEX idx_daily_records_user ON daily_records(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- RLS策略 (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "用户访问自己的数据" ON users
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "用户访问自己的笔记" ON notes
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "用户访问自己的记录" ON daily_records
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "用户访问自己的支付" ON payments
  FOR ALL USING (auth.uid()::text = user_id::text);