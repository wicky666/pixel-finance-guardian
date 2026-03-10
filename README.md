# Pixel Finance Guardian

Math simulation and behavior review tool. Cost analysis and decision impact—no price predictions, no trading advice.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js
- **Math:** decimal.js (all cost/finance calculations)
- **Validation:** zod
- **Backend (planned):** Supabase / PostgreSQL
- **UI utilities:** clsx, tailwind-merge, react-hook-form

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `npm run dev` | Start dev server   |
| `npm run build` | Production build |
| `npm run start` | Start production  |
| `npm run lint` | Run ESLint        |

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — Shared UI components
- `features/` — Feature modules (sandbox, shadow, behavior, vision, social, report)
- `lib/` — Utilities (math, db, compliance, ai, utils)
- `public/` — Static assets
- `styles/` — Global CSS
- `tasks/` — Task and docs

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase keys when needed.
