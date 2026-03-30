import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, initDB } from './_lib/db';
import { generateToken, authMiddleware, adminMiddleware } from './_lib/jwt';
import { generateCardCells } from './_lib/card-generator';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB on first request
let dbInitialized = false;
app.use(async (_req, _res, next) => {
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
  next();
});

// ===================== AUTH =====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, role',
      [name, email, hashedPassword, phone || null, 'USER']
    );

    const token = generateToken(email, result.rows[0].role);
    res.json({ token, name, email, role: result.rows[0].role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.email, user.role);
    res.json({ token, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [token, expiry, email]);

      // Send email via Resend
      const appUrl = process.env.APP_URL || 'https://bingo-botconversa.vercel.app';
      const resetLink = `${appUrl}/reset-password?token=${token}`;

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Bingo Botconversa <onboarding@resend.dev>',
            to: [email],
            subject: 'Recuperação de Senha - Bingo',
            html: `<h2>Recuperação de Senha</h2><p>Clique no link abaixo para redefinir sua senha:</p><p><a href="${resetLink}" style="background:#9C27B0;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Redefinir Senha</a></p><p>Este link expira em 1 hora.</p><p>Se você não solicitou a recuperação, ignore este email.</p>`
          })
        });
        if (!response.ok) {
          console.warn('Resend API error:', await response.text());
        }
      } catch (emailErr) {
        console.warn('Failed to send email:', emailErr);
      }
    }

    res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token e senha são obrigatórios' });

    const user = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== USER PROFILE =====================

app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const result = await query(
      'SELECT id, name, email, phone, profile_photo_url as "profilePhotoUrl", role FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const { name, phone, email: newEmail } = req.body;

    if (newEmail && newEmail !== email) {
      const existing = await query('SELECT id FROM users WHERE email = $1', [newEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    const result = await query(
      `UPDATE users SET name = $1, phone = $2, email = COALESCE($3, email)
       WHERE email = $4
       RETURNING id, name, email, phone, profile_photo_url as "profilePhotoUrl", role`,
      [name, phone || null, newEmail || null, email]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== ADMIN: USERS =====================

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, profile_photo_url as "profilePhotoUrl", role FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:userId/toggle-admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    const newRole = user.rows[0].role === 'ADMIN' ? 'USER' : 'ADMIN';
    const result = await query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, name, email, phone, profile_photo_url as "profilePhotoUrl", role`,
      [newRole, userId]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const email = (req as any).userEmail;

    // Prevent self-deletion
    const self = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (self.rows[0].id === parseInt(userId)) {
      return res.status(400).json({ error: 'Você não pode excluir a si mesmo' });
    }

    const user = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Delete related data first (foreign keys)
    await query('DELETE FROM card_cells WHERE card_id IN (SELECT id FROM bingo_cards WHERE user_id = $1)', [userId]);
    await query('DELETE FROM winners WHERE user_id = $1', [userId]);
    await query('DELETE FROM bingo_cards WHERE user_id = $1', [userId]);
    await query('DELETE FROM participants WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== GAMES =====================

app.get('/api/games/active', authMiddleware, async (_req, res) => {
  try {
    const result = await query(
      `SELECT g.*, (SELECT COUNT(*) FROM participants WHERE game_id = g.id) as "participantCount"
       FROM games g WHERE g.status IN ('PENDING', 'ACTIVE', 'PAUSED')
       ORDER BY g.created_at DESC LIMIT 1`
    );
    if (result.rows.length === 0) return res.json(null);

    const game = result.rows[0];
    res.json({
      id: game.id,
      status: game.status,
      drawMode: game.draw_mode,
      drawIntervalSeconds: game.draw_interval_seconds,
      drawnNumbers: game.drawn_numbers || [],
      participantCount: parseInt(game.participantCount),
      createdAt: game.created_at,
      startedAt: game.started_at,
      finishedAt: game.finished_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/games/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT g.*, (SELECT COUNT(*) FROM participants WHERE game_id = g.id) as "participantCount"
       FROM games g WHERE g.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });

    const game = result.rows[0];
    res.json({
      id: game.id,
      status: game.status,
      drawMode: game.draw_mode,
      drawIntervalSeconds: game.draw_interval_seconds,
      drawnNumbers: game.drawn_numbers || [],
      participantCount: parseInt(game.participantCount),
      createdAt: game.created_at,
      startedAt: game.started_at,
      finishedAt: game.finished_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/games', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { drawMode, drawIntervalSeconds } = req.body;

    const active = await query("SELECT id FROM games WHERE status IN ('PENDING', 'ACTIVE', 'PAUSED')");
    if (active.rows.length > 0) {
      return res.status(400).json({ error: 'Já existe um jogo ativo ou pendente' });
    }

    const result = await query(
      'INSERT INTO games (status, draw_mode, draw_interval_seconds) VALUES ($1, $2, $3) RETURNING *',
      ['PENDING', drawMode || 'MANUAL', drawIntervalSeconds || 5]
    );

    const game = result.rows[0];
    res.json({
      id: game.id,
      status: game.status,
      drawMode: game.draw_mode,
      drawIntervalSeconds: game.draw_interval_seconds,
      drawnNumbers: [],
      participantCount: 0,
      createdAt: game.created_at,
      startedAt: game.started_at,
      finishedAt: game.finished_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start game: generate cards for all participants
app.post('/api/admin/games/:id/start', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (game.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });
    if (game.rows[0].status !== 'PENDING') return res.status(400).json({ error: 'Jogo já foi iniciado' });

    const participants = await query('SELECT user_id FROM participants WHERE game_id = $1', [gameId]);
    if (participants.rows.length === 0) {
      return res.status(400).json({ error: 'Nenhum participante no jogo' });
    }

    // Generate cards for each participant
    for (const p of participants.rows) {
      const cardResult = await query(
        'INSERT INTO bingo_cards (game_id, user_id) VALUES ($1, $2) RETURNING id',
        [gameId, p.user_id]
      );
      const cardId = cardResult.rows[0].id;
      const cells = generateCardCells();

      for (const cell of cells) {
        await query(
          'INSERT INTO card_cells (card_id, row_idx, col_idx, number) VALUES ($1, $2, $3, $4)',
          [cardId, cell.rowIdx, cell.colIdx, cell.number]
        );
      }
    }

    await query("UPDATE games SET status = 'ACTIVE', started_at = NOW() WHERE id = $1", [gameId]);
    res.json({ status: 'ACTIVE', participantCount: participants.rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Draw a number
app.post('/api/admin/games/:id/draw', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (game.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });
    if (game.rows[0].status !== 'ACTIVE') return res.status(400).json({ error: 'Jogo não está ativo' });

    const drawn: number[] = game.rows[0].drawn_numbers || [];
    const drawnSet = new Set(drawn);
    const remaining: number[] = [];
    for (let i = 1; i <= 75; i++) {
      if (!drawnSet.has(i)) remaining.push(i);
    }

    if (remaining.length === 0) {
      await query("UPDATE games SET status = 'FINISHED', finished_at = NOW() WHERE id = $1", [gameId]);
      return res.json({ finished: true, drawnNumbers: drawn });
    }

    const number = remaining[Math.floor(Math.random() * remaining.length)];
    drawn.push(number);

    await query('UPDATE games SET drawn_numbers = $1 WHERE id = $2', [drawn, gameId]);

    // Mark cells as drawn
    await query(
      `UPDATE card_cells SET drawn = true
       WHERE number = $1 AND card_id IN (SELECT id FROM bingo_cards WHERE game_id = $2)`,
      [number, gameId]
    );

    res.json({ number, drawnNumbers: drawn, totalDrawn: drawn.length, remaining: 75 - drawn.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/games/:id/pause', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query("UPDATE games SET status = 'PAUSED' WHERE id = $1 AND status = 'ACTIVE'", [req.params.id]);
    res.json({ status: 'PAUSED' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/games/:id/resume', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await query("UPDATE games SET status = 'ACTIVE' WHERE id = $1 AND status = 'PAUSED'", [req.params.id]);
    res.json({ status: 'ACTIVE' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/games/:id/finish', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await query(
      "UPDATE games SET status = 'FINISHED', finished_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });
    const game = result.rows[0];
    res.json({
      id: game.id, status: game.status, drawMode: game.draw_mode,
      drawIntervalSeconds: game.draw_interval_seconds, drawnNumbers: game.drawn_numbers || [],
      participantCount: 0, createdAt: game.created_at, startedAt: game.started_at, finishedAt: game.finished_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== PARTICIPANTS =====================

app.get('/api/games/:gameId/participants', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.user_id as "userId", u.name, u.email,
              u.profile_photo_url as "profilePhotoUrl", p.joined_at as "joinedAt"
       FROM participants p JOIN users u ON p.user_id = u.id
       WHERE p.game_id = $1 ORDER BY p.joined_at`,
      [req.params.gameId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/:gameId/join', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const gameId = req.params.gameId;

    const game = await query('SELECT status FROM games WHERE id = $1', [gameId]);
    if (game.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });
    if (game.rows[0].status !== 'PENDING') return res.status(400).json({ error: 'Só é possível entrar em jogos pendentes' });

    const user = await query('SELECT id, name FROM users WHERE email = $1', [email]);
    const userId = user.rows[0].id;

    const existing = await query('SELECT id FROM participants WHERE game_id = $1 AND user_id = $2', [gameId, userId]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Você já está participando' });

    const result = await query(
      'INSERT INTO participants (game_id, user_id) VALUES ($1, $2) RETURNING id, joined_at as "joinedAt"',
      [gameId, userId]
    );

    res.json({ id: result.rows[0].id, userId, name: user.rows[0].name, joinedAt: result.rows[0].joinedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/games/:gameId/my-participation', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    const result = await query(
      'SELECT id FROM participants WHERE game_id = $1 AND user_id = $2',
      [req.params.gameId, user.rows[0].id]
    );
    res.json({ participating: result.rows.length > 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CARDS =====================

app.get('/api/games/:gameId/my-card', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    const userId = user.rows[0].id;

    const card = await query(
      'SELECT id, game_id as "gameId", completed, completion_rank as "completionRank" FROM bingo_cards WHERE game_id = $1 AND user_id = $2',
      [req.params.gameId, userId]
    );

    if (card.rows.length === 0) return res.json(null);

    const cells = await query(
      'SELECT id, row_idx as "rowIdx", col_idx as "colIdx", number, drawn, confirmed FROM card_cells WHERE card_id = $1 ORDER BY col_idx, row_idx',
      [card.rows[0].id]
    );

    res.json({ ...card.rows[0], cells: cells.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cards/:cardId/confirm/:cellId', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const { cardId, cellId } = req.params;

    // Verify ownership
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    const card = await query('SELECT id, game_id, user_id FROM bingo_cards WHERE id = $1', [cardId]);
    if (card.rows.length === 0) return res.status(404).json({ error: 'Cartela não encontrada' });
    if (card.rows[0].user_id !== user.rows[0].id) return res.status(403).json({ error: 'Cartela não pertence a você' });

    // Verify cell
    const cell = await query('SELECT id, drawn, confirmed FROM card_cells WHERE id = $1 AND card_id = $2', [cellId, cardId]);
    if (cell.rows.length === 0) return res.status(404).json({ error: 'Célula não encontrada' });
    if (!cell.rows[0].drawn) return res.status(400).json({ error: 'Número ainda não foi sorteado' });
    if (cell.rows[0].confirmed) return res.json({ confirmed: true, alreadyConfirmed: true });

    await query('UPDATE card_cells SET confirmed = true WHERE id = $1', [cellId]);

    // Check completion
    const confirmed = await query('SELECT COUNT(*) as count FROM card_cells WHERE card_id = $1 AND confirmed = true', [cardId]);
    const confirmedCount = parseInt(confirmed.rows[0].count);
    const isComplete = confirmedCount === 25;

    // Winner registration now happens via BINGO button claim

    res.json({ confirmed: true, complete: isComplete, confirmedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== RANKING =====================

app.get('/api/games/:gameId/ranking', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT w.rank, w.user_id as "userId", u.name, u.profile_photo_url as "profilePhotoUrl", w.completed_at as "completedAt"
       FROM winners w JOIN users u ON w.user_id = u.id
       WHERE w.game_id = $1 ORDER BY w.rank`,
      [req.params.gameId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== POLLING ENDPOINT =====================
// Replaces WebSocket - frontend polls this every 2-3 seconds during active game

app.get('/api/games/:gameId/poll', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.gameId;

    const game = await query('SELECT status, drawn_numbers FROM games WHERE id = $1', [gameId]);
    if (game.rows.length === 0) return res.status(404).json({ error: 'Jogo não encontrado' });

    const winners = await query(
      `SELECT w.rank, w.user_id as "userId", u.name, u.profile_photo_url as "profilePhotoUrl", w.completed_at as "completedAt"
       FROM winners w JOIN users u ON w.user_id = u.id
       WHERE w.game_id = $1 ORDER BY w.rank`,
      [gameId]
    );

    res.json({
      status: game.rows[0].status,
      drawnNumbers: game.rows[0].drawn_numbers || [],
      winners: winners.rows
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// BINGO CLAIM - player clicks BINGO button when they complete their card
app.post('/api/games/:gameId/bingo', authMiddleware, async (req, res) => {
  try {
    const email = (req as any).userEmail;
    const gameId = req.params.gameId;

    const user = await query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    const userId = user.rows[0].id;

    const card = await query('SELECT id, completed FROM bingo_cards WHERE game_id = $1 AND user_id = $2', [gameId, userId]);
    if (card.rows.length === 0) return res.status(404).json({ error: 'Cartela não encontrada' });

    // Check all 25 cells are confirmed
    const confirmed = await query('SELECT COUNT(*) as count FROM card_cells WHERE card_id = $1 AND confirmed = true', [card.rows[0].id]);
    if (parseInt(confirmed.rows[0].count) !== 25) {
      return res.status(400).json({ error: 'Cartela não está completa' });
    }

    // Check if already claimed
    const existingWinner = await query('SELECT id FROM winners WHERE game_id = $1 AND user_id = $2', [gameId, userId]);
    if (existingWinner.rows.length > 0) {
      return res.json({ alreadyClaimed: true, message: 'Você já registrou seu BINGO!' });
    }

    // Check max 5 winners
    const winnersCount = await query('SELECT COUNT(*) as count FROM winners WHERE game_id = $1', [gameId]);
    const rank = parseInt(winnersCount.rows[0].count) + 1;
    if (rank > 5) {
      return res.status(400).json({ error: 'Já temos 5 ganhadores' });
    }

    // Record the exact timestamp of the BINGO claim
    const now = new Date().toISOString();
    await query('UPDATE bingo_cards SET completed = true, completed_at = $1, completion_rank = $2 WHERE id = $3', [now, rank, card.rows[0].id]);
    await query('INSERT INTO winners (game_id, user_id, rank, completed_at) VALUES ($1, $2, $3, $4)', [gameId, userId, rank, now]);

    res.json({
      success: true,
      rank,
      completedAt: now,
      message: `Parabéns! Você ficou em ${rank}º lugar!`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
