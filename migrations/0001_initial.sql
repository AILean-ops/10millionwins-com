CREATE TABLE IF NOT EXISTS wins (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  location TEXT,
  role TEXT,
  category TEXT NOT NULL,
  win_text TEXT NOT NULL,
  outcome_text TEXT,
  quote TEXT NOT NULL,
  permission_public INTEGER NOT NULL DEFAULT 0,
  permission_social INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  promote INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  rejected_at TEXT,
  promoted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_wins_status_created ON wins(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wins_category_status ON wins(category, status);
CREATE INDEX IF NOT EXISTS idx_wins_promote ON wins(promote, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wins_featured ON wins(featured, status, created_at DESC);
