# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Docs-first rule

Before writing any code, ALWAYS read the relevant documentation file in the `/docs` directory first. This applies to every code generation task without exception. If a relevant doc exists for the technology or feature being implemented, it must be consulted before writing a single line of code.

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint (no auto-fix; use eslint --fix for that)
```

There is no test runner configured yet.

## Stack

- **Next.js 16** — App Router only (no Pages Router). Read `node_modules/next/dist/docs/` before writing any Next.js code; APIs differ from older versions.
- **React 19**
- **TypeScript 5** — strict mode via `tsconfig.json`
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **Geist** font loaded through `next/font/google` in `src/app/layout.tsx`

## Project structure

All application code lives under `src/app/` (App Router). The root layout (`src/app/layout.tsx`) sets up the Geist font CSS variables and a `min-h-full flex flex-col` body. `src/app/globals.css` is the Tailwind entry point.

Import alias `@/*` maps to `src/*`.
