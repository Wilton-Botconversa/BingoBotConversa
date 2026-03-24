# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bingo web app for team recreation at Botconversa. Employees self-register, join games, receive unique 5x5 bingo cards, and play in real-time with WebSocket-driven number drawing and ranking.

## Tech Stack

- **Backend**: Java 17 / Spring Boot 3.5.0 / Spring Security (JWT) / Spring WebSocket (STOMP)
- **Frontend**: Angular 21 (standalone components, lazy-loaded routes, SCSS)
- **Database**: PostgreSQL 17 with Flyway migrations
- **Real-time**: STOMP over SockJS (`/ws` endpoint)
- **WhatsApp**: Botconversa API integration

## Project Structure

```
bingo-backend/    Spring Boot API (port 8080)
bingo-frontend/   Angular SPA (port 4200)
```

## Build & Run Commands

### Backend
```bash
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot"
export PATH="$JAVA_HOME/bin:/c/tools/apache-maven-3.9.9/bin:$PATH"
cd bingo-backend
mvn compile          # compile only
mvn spring-boot:run  # run (requires PostgreSQL on localhost:5432, db: bingo)
```

### Frontend
```bash
cd bingo-frontend
npx ng serve         # dev server on localhost:4200
npx ng build         # production build
```

### Database
```bash
PGPASSWORD=postgres "/c/Program Files/PostgreSQL/17/bin/psql.exe" -U postgres -d bingo
```
Flyway auto-runs migrations on backend startup. Schema in `bingo-backend/src/main/resources/db/migration/`.

## Architecture

### Backend Packages (`com.bingo.*`)
- `auth/` — JWT auth (register, login, forgot/reset password)
- `user/` — Profile CRUD
- `game/` — Game lifecycle + DrawingService (manual/automatic number drawing with ScheduledExecutorService)
- `card/` — BingoCard generation (unique 5x5 cards per participant) + cell confirmation
- `participant/` — Join game logic
- `ranking/` — Winner detection (25/25 confirmed cells) + top 5 ranking
- `websocket/` — STOMP config
- `integration/` — BotconversaClient (WhatsApp messaging)
- `config/` — SecurityConfig (JWT filter), WebSocketConfig, GlobalExceptionHandler

### Frontend Layout (`src/app/`)
- `core/` — Services (auth, game, card, participant, websocket), guards, interceptors, models
- `layout/` — Sidebar + MainLayout (sidebar always visible for authenticated users)
- `pages/` — login, register, forgot-password, participantes, tabelas (bingo-card sub-component), meu-perfil, admin/game-control
- `shared/` — ranking-board component

### Key Design Decisions
- Auth: stateless JWT, email as principal. Admin role controls game flow.
- WebSocket topics: `/topic/game/{id}/draw`, `/topic/game/{id}/ranking`, `/topic/game/{id}/status`
- Auto-draw uses `ScheduledExecutorService` (not `@Scheduled`) for per-game dynamic intervals (5-10s)
- Cell confirmation is POST (transactional), not WebSocket, for data integrity
- Bingo format: 5x5, numbers 1-75, B(1-15)/I(16-30)/N(31-45)/G(46-60)/O(61-75), no free space
- Card uniqueness: random generation + HashSet signature check (collision probability ~0 for <50 players)

### Game Flow
1. Admin creates game (PENDING) → players join
2. Admin starts game → cards generated, WhatsApp links sent, status=ACTIVE
3. Numbers drawn (manual click or auto-timer) → broadcast via WebSocket
4. Drawn numbers appear YELLOW on cards → player clicks to confirm (GREEN)
5. 25/25 confirmed → winner registered, ranking broadcast (max 5 winners)

## Configuration

Environment variables (or defaults in `application.yml`):
- `DB_USERNAME` / `DB_PASSWORD` (default: postgres/postgres)
- `JWT_SECRET` (must be ≥256 bits in production)
- `BOTCONVERSA_API_KEY`
- `MAIL_HOST` / `MAIL_USERNAME` / `MAIL_PASSWORD` (for password reset emails)

## Admin Access

First admin must be promoted manually:
```sql
UPDATE users SET role='ADMIN' WHERE email='admin@botconversa.com.br';
```
