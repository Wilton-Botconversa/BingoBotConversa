CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    role VARCHAR(10) NOT NULL DEFAULT 'USER',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    draw_mode VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    draw_interval_seconds INT DEFAULT 5,
    drawn_numbers INT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE TABLE participants (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(game_id, user_id)
);

CREATE TABLE bingo_cards (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    completion_rank INT,
    UNIQUE(game_id, user_id)
);

CREATE TABLE card_cells (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL REFERENCES bingo_cards(id),
    row_idx INT NOT NULL,
    col_idx INT NOT NULL,
    number INT NOT NULL,
    drawn BOOLEAN DEFAULT FALSE,
    confirmed BOOLEAN DEFAULT FALSE
);

CREATE TABLE winners (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    rank INT NOT NULL,
    completed_at TIMESTAMP
);
