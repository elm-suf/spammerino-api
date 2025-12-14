# Spammerino API

Spammerino API is a small Hono-based HTTP service that exposes Twitch user and emote data with a typed OpenAPI spec. It uses Zod for schema validation, `@hono/zod-openapi` for route typing and spec generation, and Twurple plus a helper library to fetch Twitch and third‑party emotes. Interactive API documentation is available via Scalar.

## Features
- Typed routes and OpenAPI spec generation with `@hono/zod-openapi`
- Input validation with `zod`
- Logging with `hono-pino` and `pino`
- Twitch API integration via `@twurple/api` and `@twurple/auth`
- Emote aggregation from Twitch, BTTV, FFZ, and 7TV
- Interactive docs UI at `/reference` backed by `/doc`

## Tech Stack
- Runtime: `node` + `hono`
- Schemas/Docs: `zod`, `@hono/zod-openapi`, `@scalar/hono-api-reference`
- Twitch: `@twurple/api`, `@twurple/auth`, `@mkody/twitch-emoticons`
- Tooling: `typescript`, `eslint`, `vitest`

## Getting Started

### Prerequisites
- Node 18+ recommended
- `pnpm` is used in scripts; `npm`/`yarn` work with equivalent commands

### Installation
```sh
pnpm install
```

### Environment
Create `.env` in the project root:
```env
# server
PORT=9999
LOG_LEVEL=info

# twitch
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```
- Do not commit secrets. Keep `TWITCH_CLIENT_SECRET` private.
- `PORT` and `LOG_LEVEL` are optional; defaults are set in code.

### Run in Development
```sh
pnpm dev
```
Open:
- Spec: `http://localhost:9999/doc`
- Docs UI: `http://localhost:9999/reference`

### Lint, Typecheck, Test
```sh
pnpm lint
pnpm typecheck
pnpm test
```

### Build and Start
```sh
pnpm build
pnpm start
```

## API Overview

Base URL: `http://localhost:9999`

### Index
- `GET /`  
  Returns a simple status message.

### Users
- `GET /users/{userName}`  
  Fetches a Twitch user by username.
  - Path params:
    - `userName`: string (Twitch login name)
  - Response: user metadata

- `GET /users/{id}/emotes`  
  Fetches emotes available for a Twitch channel by numeric `id`.
  - Path params:
    - `id`: number (Twitch user/channel ID)
  - Response: array of `{ name, link, type }`

- `GET /users/{userName}/emotes`  
  Fetches emotes for a channel by `userName`.
  - Path params:
    - `userName`: string (Twitch login name)
  - Response: array of `{ name, link, type }`

### OpenAPI and Docs
- Spec: `GET /doc`
- Scalar UI: `GET /reference`

## Usage Examples

Fetch a user by username:
```sh
curl "http://localhost:9999/users/sodapoppin"
```

Fetch emotes by numeric ID:
```sh
curl "http://localhost:9999/users/95304188/emotes"
```

Fetch emotes by username:
```sh
curl "http://localhost:9999/users/sodapoppin/emotes"
```

## Project Structure
```
src/
  app.ts                    # App composition
  index.ts                  # Local dev server entry
  env.ts                    # Typed environment configuration
  lib/
    configure-open-api.ts   # OpenAPI + Scalar docs
    create-app.ts           # Hono app factory with middlewares
  routes/
    index.route.ts          # Index route
    users/
      users.index.ts        # Users router registration
      users.routes.ts       # Route definitions + schemas
      users.handlers.ts     # Request handlers
      user.model.ts         # Zod schemas and mappers
  core/
    twitch-singleton.ts     # Twurple API client singleton
    twitch-emotes.service.ts# Emote aggregation service
```

## Notes
- Ensure valid Twitch client credentials are present in `.env` before running.
- Interactive docs (`/reference`) are generated from the OpenAPI spec (`/doc`).
- This project uses ESM modules; Node must be configured accordingly.

## License
MIT

