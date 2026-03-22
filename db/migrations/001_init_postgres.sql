-- PostgreSQL initial schema for independent backend deployment
-- Target: Aliyun RDS PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  nickname TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(32) NOT NULL,
  current_quantity NUMERIC(20, 8) NOT NULL DEFAULT 0,
  average_cost NUMERIC(20, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);

CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  current_price NUMERIC(20, 8) NOT NULL,
  add_amount NUMERIC(20, 8) NOT NULL DEFAULT 0,
  add_quantity NUMERIC(20, 8) NOT NULL DEFAULT 0,
  simulated_avg_cost NUMERIC(20, 8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS real_shadow_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
  real_avg_cost NUMERIC(20, 8) NOT NULL,
  shadow_avg_cost NUMERIC(20, 8) NOT NULL,
  impact_score NUMERIC(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style VARCHAR(20) NOT NULL,
  tone VARCHAR(20) NOT NULL,
  content_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_portfolio_id ON simulation_scenarios(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_pairs_scenario_id ON real_shadow_pairs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_behavior_user_id ON behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON daily_reviews(user_id);
