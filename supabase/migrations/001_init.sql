-- =========================================================================
-- 001_init.sql — Phase 1 schema for the finance app
-- =========================================================================

-- -------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------
CREATE TYPE wallet_kind       AS ENUM ('cash', 'bank', 'credit_card', 'savings', 'other');
CREATE TYPE category_kind     AS ENUM ('expense', 'income');
CREATE TYPE transaction_kind  AS ENUM ('expense', 'income', 'transfer');
CREATE TYPE recurrence_freq   AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- -------------------------------------------------------------------------
-- updated_at trigger function
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- -------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     text,
  default_currency char(3) NOT NULL DEFAULT 'USD',
  locale           text NOT NULL DEFAULT 'en-US',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_delete ON public.profiles FOR DELETE USING (auth.uid() = id);

-- -------------------------------------------------------------------------
-- wallets
-- -------------------------------------------------------------------------
CREATE TABLE public.wallets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  kind            wallet_kind NOT NULL DEFAULT 'cash',
  initial_balance bigint NOT NULL DEFAULT 0,
  color           text,
  icon            text,
  is_archived     boolean NOT NULL DEFAULT false,
  position        smallint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX wallets_user_active_idx ON public.wallets (user_id)
  WHERE deleted_at IS NULL AND is_archived = false;

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_select ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wallets_insert ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wallets_update ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY wallets_delete ON public.wallets FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- categories
-- -------------------------------------------------------------------------
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  kind        category_kind NOT NULL,
  color       text,
  icon        text,
  parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_archived boolean NOT NULL DEFAULT false,
  position    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX categories_user_kind_active_idx ON public.categories (user_id, kind)
  WHERE deleted_at IS NULL AND is_archived = false;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY categories_insert ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_update ON public.categories FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_delete ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- recurring_rules
-- -------------------------------------------------------------------------
CREATE TABLE public.recurring_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id     uuid NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
  category_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  kind          transaction_kind NOT NULL,
  amount        bigint NOT NULL,
  note          text,
  freq          recurrence_freq NOT NULL,
  interval      smallint NOT NULL DEFAULT 1,
  starts_on     date NOT NULL,
  ends_on       date,
  next_run_on   date NOT NULL,
  last_run_on   date,
  is_paused     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  CHECK (amount > 0),
  CHECK (interval > 0)
);

CREATE TRIGGER trg_recurring_rules_updated_at
  BEFORE UPDATE ON public.recurring_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY recurring_rules_select ON public.recurring_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY recurring_rules_insert ON public.recurring_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY recurring_rules_update ON public.recurring_rules FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY recurring_rules_delete ON public.recurring_rules FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- transactions
-- -------------------------------------------------------------------------
CREATE TABLE public.transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id           uuid NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
  transfer_wallet_id  uuid REFERENCES public.wallets(id) ON DELETE RESTRICT,
  category_id         uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  kind                transaction_kind NOT NULL,
  amount              bigint NOT NULL,
  occurred_at         timestamptz NOT NULL,
  note                text,
  tags                text[] NOT NULL DEFAULT '{}',
  receipt_path        text,
  recurring_rule_id   uuid REFERENCES public.recurring_rules(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  CHECK (amount > 0),
  CHECK (
    (kind = 'transfer' AND transfer_wallet_id IS NOT NULL AND transfer_wallet_id <> wallet_id)
    OR (kind <> 'transfer' AND transfer_wallet_id IS NULL)
  )
);

CREATE INDEX transactions_user_occurred_idx
  ON public.transactions (user_id, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX transactions_user_wallet_occurred_idx
  ON public.transactions (user_id, wallet_id, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX transactions_user_category_occurred_idx
  ON public.transactions (user_id, category_id, occurred_at DESC) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_select ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY transactions_insert ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_update ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_delete ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- budgets
-- -------------------------------------------------------------------------
CREATE TABLE public.budgets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id     uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  amount          bigint NOT NULL,
  period_month    date,
  is_recurring    boolean NOT NULL DEFAULT true,
  alert_threshold smallint NOT NULL DEFAULT 80,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  CHECK (amount > 0),
  CHECK (alert_threshold BETWEEN 1 AND 200),
  CHECK ((is_recurring = true  AND period_month IS NULL)
      OR (is_recurring = false AND period_month IS NOT NULL))
);

CREATE UNIQUE INDEX budgets_user_category_period_uniq
  ON public.budgets (
    user_id,
    COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(period_month, '0001-01-01'::date)
  )
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_select ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY budgets_insert ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY budgets_update ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY budgets_delete ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- Storage bucket (run via Supabase dashboard or SQL):
--   bucket: 'receipts'
--   public: false
--   path policy: leading segment must equal auth.uid()::text
-- -------------------------------------------------------------------------
