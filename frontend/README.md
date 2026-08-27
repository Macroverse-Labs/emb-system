# emb-system frontend

Next.js frontend with TypeScript and Tailwind CSS.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Build for production

```bash
pnpm build
```

## Pages

- `/` — Landing page
- `/login` — Sign in
- `/register` — Sign up
- `/dashboard` — Protected dashboard

## Environment variables

- `NEXT_PUBLIC_API_URL` — Base URL of the FastAPI backend
