-- Pixel Finance Guardian — Initial schema (MVP)
-- Tables: portfolios, simulation_scenarios, real_snapshots, shadow_snapshots, behavior_events, user_profiles
-- No real identity fields; supports simulation & behavior replay only.

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. user_profiles (referenced by user_id in other tables; id = user_id from auth later)
-- ---------------------------------------------------------------------------
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  nickname TEXT,
  avatar_seed TEXT,
  survival_level INTEGER NOT NULL DEFAULT 0 CHECK (survival_level >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_profiles IS 'User profile for display; no real identity. user_id can link to auth.users(id) when auth is enabled.';

CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);

-- ---------------------------------------------------------------------------
-- 2. portfolios — one row per user per symbol
-- ---------------------------------------------------------------------------
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  current_quantity NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  average_cost NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (average_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);

COMMENT ON TABLE portfolios IS 'Per-user per-symbol position; simulation only, no real brokerage link.';

CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);
CREATE INDEX idx_portfolios_updated_at ON portfolios (updated_at DESC);

-- ---------------------------------------------------------------------------
-- 3. simulation_scenarios — one cost simulation per portfolio
-- ---------------------------------------------------------------------------
CREATE TABLE simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
  current_price NUMERIC(20, 8) NOT NULL CHECK (current_price >= 0),
  add_amount NUMERIC(20, 8) NOT NULL CHECK (add_amount >= 0),
  add_quantity NUMERIC(20, 8) NOT NULL CHECK (add_quantity >= 0),
  simulated_avg_cost NUMERIC(20, 8) NOT NULL CHECK (simulated_avg_cost >= 0),
  cost_improvement_efficiency NUMERIC(10, 4),
  breakeven_rebound_pct NUMERIC(10, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE simulation_scenarios IS 'Saved cost-averaging simulation; links to real/shadow snapshots.';

CREATE INDEX idx_simulation_scenarios_portfolio_id ON simulation_scenarios (portfolio_id);
CREATE INDEX idx_simulation_scenarios_created_at ON simulation_scenarios (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. real_snapshots — state after user applies the scenario (real path)
-- ---------------------------------------------------------------------------
CREATE TABLE real_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES simulation_scenarios (id) ON DELETE CASCADE,
  quantity NUMERIC(20, 8) NOT NULL CHECK (quantity >= 0),
  avg_cost NUMERIC(20, 8) NOT NULL CHECK (avg_cost >= 0),
  cash_spent NUMERIC(20, 8) NOT NULL CHECK (cash_spent >= 0),
  snapshot_price NUMERIC(20, 8) NOT NULL CHECK (snapshot_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE real_snapshots IS 'Snapshot of portfolio after user executed the scenario (real path).';

CREATE UNIQUE INDEX idx_real_snapshots_scenario_id ON real_snapshots (scenario_id);
CREATE INDEX idx_real_snapshots_portfolio_id ON real_snapshots (portfolio_id);
CREATE INDEX idx_real_snapshots_created_at ON real_snapshots (created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. shadow_snapshots — state if user did nothing (shadow path)
-- ---------------------------------------------------------------------------
CREATE TABLE shadow_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios (id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES simulation_scenarios (id) ON DELETE CASCADE,
  quantity NUMERIC(20, 8) NOT NULL CHECK (quantity >= 0),
  avg_cost NUMERIC(20, 8) NOT NULL CHECK (avg_cost >= 0),
  cash_spent NUMERIC(20, 8) NOT NULL CHECK (cash_spent >= 0),
  snapshot_price NUMERIC(20, 8) NOT NULL CHECK (snapshot_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE shadow_snapshots IS 'Snapshot of portfolio if user had not applied the scenario (shadow path).';

CREATE UNIQUE INDEX idx_shadow_snapshots_scenario_id ON shadow_snapshots (scenario_id);
CREATE INDEX idx_shadow_snapshots_portfolio_id ON shadow_snapshots (portfolio_id);
CREATE INDEX idx_shadow_snapshots_created_at ON shadow_snapshots (created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. behavior_events — event log for behavior / brake analysis
-- ---------------------------------------------------------------------------
CREATE TABLE behavior_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  portfolio_id UUID REFERENCES portfolios (id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN behavior_events.metadata_json IS 'Extra event payload: e.g. scenario_id, counts, thresholds. Structure depends on event_type.';
COMMENT ON TABLE behavior_events IS 'Behavior log: simulation, save, consecutive_add, high_freq_warning, etc.';

CREATE INDEX idx_behavior_events_user_id ON behavior_events (user_id);
CREATE INDEX idx_behavior_events_created_at ON behavior_events (created_at DESC);
CREATE INDEX idx_behavior_events_event_type ON behavior_events (event_type);
CREATE INDEX idx_behavior_events_metadata_gin ON behavior_events USING GIN (metadata_json);

-- ---------------------------------------------------------------------------
-- updated_at trigger for user_profiles and portfolios
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
