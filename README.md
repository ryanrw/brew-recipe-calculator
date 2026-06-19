# Brew Recipe

A pourover coffee calculator (React + Vite + Turborepo + TypeScript). See [`.claude/prompt.md`](.claude/prompt.md) for the original requirements and [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for project guidance given to Claude Code.

## Monorepo layout

- `apps/web` — the dashboard
- `apps/storybook` — component docs for `@brew-recipe/ui`
- `packages/calculator` — pure brew math (Vitest)
- `packages/ui` — `Picker`, `Toggle`, `RecipeTable` (Vitest)

## Prerequisites

- Node 20+ (`node --version`)
- pnpm 9+ (`pnpm --version`)

## Install

```sh
pnpm install
```

## Run the dashboard

```sh
pnpm dev                              # all apps in parallel
pnpm --filter @brew-recipe/web dev    # just the dashboard
```

Open the URL Vite prints (default `http://localhost:5173`).

## Run Storybook

```sh
pnpm --filter @brew-recipe/storybook storybook
```

Default `http://localhost:6006`.

## Build

```sh
pnpm build                            # build every package and app
pnpm --filter @brew-recipe/web build  # just the dashboard
```

## Test

```sh
pnpm test                                          # every package
pnpm --filter @brew-recipe/calculator test        # just the math
pnpm --filter @brew-recipe/ui test                 # just the UI components
```

Run a single test file:

```sh
pnpm --filter @brew-recipe/calculator test -- recipe.test
pnpm --filter @brew-recipe/ui test -- Picker.test
```

Watch mode (re-runs on file change):

```sh
pnpm --filter @brew-recipe/ui test:watch
```

## Lint

```sh
pnpm lint
pnpm --filter @brew-recipe/web lint
```

## Lint a single file

`tsc` only operates on whole tsconfigs, so to check one file in isolation, narrow the include temporarily or run the full project lint and read the output:

```sh
pnpm --filter @brew-recipe/web lint
```
