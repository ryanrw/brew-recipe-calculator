# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Coffee Drip Calculator Dashboard

A pourover coffee brewing calculator that eliminates the manual math of recipe scaling. See `.claude/prompt.md` for the full requirements.

## Tech Stack (required)

- **React** — UI framework
- **Vite** — build tool / dev server
- **Turborepo** — monorepo orchestration
- **TypeScript** — language

## Domain Logic

The calculator computes pour targets from user inputs:

- `totalWater = coffeeGrams × ratio`
- `remainingWater = totalWater − bloomGrams`
- `perPour = remainingWater / numPours`
- Each pour's cumulative scale reading is `bloomGrams + (n × perPour)`
- Advanced: `(totalTime − bloomTime) / numPours` = time per pour after bloom

Input ranges (per requirements):
- Coffee: 8g – 25g (scroll-wheel picker)
- Ratio: 1:2 – 1:20 (scroll-wheel picker)
- Bloom: number input
- Number of pours: 1 – 10 (scroll-wheel picker)
- Advanced time inputs: scroll-wheel, gated by a toggle

## Testing

Do **not** run tests automatically. Provide the command line for the user to run themselves. Prefer commands that target a single test or file when possible.

## Monorepo Layout

- `apps/web` — Vite + React dashboard (the actual app).
- `apps/storybook` — Storybook for `@brew-recipe/ui` components.
- `packages/calculator` — Pure brew math (`calculateRecipe`), framework-free. Vitest tests live here.
- `packages/ui` — React components (`Picker`, `Toggle`, `RecipeTable`) consumed by `apps/web` and `apps/storybook`.

Packages are referenced via pnpm workspace protocol (`workspace:*`). All packages export their `src/index.ts` directly — no build step required for consumption in dev.

## Commands (user runs)

Install: `pnpm install`
Dev (all): `pnpm dev`
Dev (web only): `pnpm --filter @brew-recipe/web dev`
Storybook: `pnpm --filter @brew-recipe/storybook storybook`
Build: `pnpm build`
Test: `pnpm test`
Test one file: `pnpm --filter @brew-recipe/calculator test -- recipe.test`
