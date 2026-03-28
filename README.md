# Todo Task API

Backend for **Todo Task API**. Clients sign in with **Google** (ID token exchange); the server issues **JWT access and refresh tokens**, supports **refresh** and **logout**, and exposes **user-scoped tasks** (list with pagination/search, create, toggle done) for the signed-in user. All HTTP routes live under **`/api/v1`**; OpenAPI (Swagger) UI is at **`/api`**.

Stack: NestJS, TypeORM, PostgreSQL, Joi-validated config.

## Requirements

- Node.js (LTS recommended)
- Yarn 1.x
- PostgreSQL

## Setup

```bash
yarn install
```

Create a `.env` file in the project root (and optionally `.env.development` / `.env.production` for overrides). At minimum, set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_TOKEN_AUDIENCE` | JWT audience claim |
| `JWT_TOKEN_ISSUER` | JWT issuer claim |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Optional: `PORT` (default `8008`), `NODE_ENV`, `DATABASE_SYNC`, `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL`. For HTTPS locally, set `SSL_KEY_PATH` and `SSL_CERT_PATH` to existing key/cert files.

Configuration is validated at startup via Joi (`src/config/environment.validattion.ts`).

## Run

```bash
# development (watch)
yarn start:dev

# production build
yarn build
yarn start:prod
```

The app listens on `http://localhost:8008` by default. Base URL: `http://localhost:8008/api/v1`.

## Scripts

| Script | Purpose |
|--------|---------|
| `yarn build` | Compile to `dist/` |
| `yarn start` | Start without watch |
| `yarn start:dev` | Dev mode with reload |
| `yarn start:debug` | Debug with inspector |
| `yarn lint` | ESLint |
| `yarn test` | Unit tests |
| `yarn test:e2e` | E2E tests |
| `yarn migration:run` | Run TypeORM migrations (dev) |

## License

UNLICENSED (private).
