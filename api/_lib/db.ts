import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 5
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(200) NOT NULL,
      phone VARCHAR(20),
      profile_photo_url TEXT,
      role VARCHAR(10) NOT NULL DEFAULT 'USER',
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      draw_mode VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
      draw_interval_seconds INT DEFAULT 5,
      last_draw_at TIMESTAMP,
      drawn_numbers INT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      started_at TIMESTAMP,
      finished_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      game_id INT NOT NULL REFERENCES games(id),
      user_id INT NOT NULL REFERENCES users(id),
      joined_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS bingo_cards (
      id SERIAL PRIMARY KEY,
      game_id INT NOT NULL REFERENCES games(id),
      user_id INT NOT NULL REFERENCES users(id),
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      completion_rank INT,
      UNIQUE(game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS card_cells (
      id SERIAL PRIMARY KEY,
      card_id INT NOT NULL REFERENCES bingo_cards(id),
      row_idx INT NOT NULL,
      col_idx INT NOT NULL,
      number INT NOT NULL,
      drawn BOOLEAN DEFAULT FALSE,
      confirmed BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS winners (
      id SERIAL PRIMARY KEY,
      game_id INT NOT NULL REFERENCES games(id),
      user_id INT NOT NULL REFERENCES users(id),
      rank INT NOT NULL,
      completed_at TIMESTAMP
    );

    -- Add last_draw_at column if it doesn't exist (for existing databases)
    ALTER TABLE games ADD COLUMN IF NOT EXISTS last_draw_at TIMESTAMP;
    -- Expand profile_photo_url to TEXT for base64 data URLs
    ALTER TABLE users ALTER COLUMN profile_photo_url TYPE TEXT;
  `);
}

export default pool;
