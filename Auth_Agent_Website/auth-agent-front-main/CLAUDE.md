# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

This project uses **Bun** as its package manager (version 1.2.7). Always use `bun` commands instead of npm, yarn, or pnpm.

## Project Architecture

This is a **Turborepo monorepo** with the following structure:

- `apps/web/` - Next.js 16.0.0 frontend application (React 19.2.0)
- Root-level workspace configuration for shared tooling

The web app runs on port **3001** by default.

### Next.js Configuration

- **Typed Routes**: Enabled (`typedRoutes: true`)
- **React Compiler**: Enabled (using babel-plugin-react-compiler)
- **App Router**: Using Next.js App Router architecture

### Key Dependencies

- **UI Components**: shadcn/ui components (via radix-ui), tailwind-merge, class-variance-authority
- **Forms**: @tanstack/react-form with Zod validation
- **State Management**: @tanstack/react-query for server state
- **Styling**: TailwindCSS v4 with next-themes for theme switching
- **Icons**: lucide-react
- **Notifications**: sonner

## Development Commands

### Running the Application

```bash
bun dev              # Start all apps in dev mode
bun dev:web          # Start only web app (port 3001)
```

### Building

```bash
bun build            # Build all apps with Turbo
```

### Type Checking

```bash
bun check-types      # Check TypeScript across all workspaces
```

### Linting & Formatting

```bash
bun check            # Run Biome linting and formatting (with --write)
```

## Code Quality Standards

### Biome Configuration

- **Formatter**: Tab indentation, double quotes
- **Auto-organize imports**: Enabled
- **Custom sorting**: Classes sorted with clsx, cva, cn functions
- **Strict rules**: Parameter assignment errors, template literal checks, self-closing elements

### TypeScript Configuration

- **Strict mode**: Enabled with additional checks:
  - `noUncheckedIndexedAccess: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
- **Module system**: ESNext with bundler resolution

### Styling Utilities

The `cn()` utility function combines clsx and tailwind-merge for className management:

```typescript
import { cn } from "@/lib/utils";
```

Use this for conditional Tailwind classes in components.

## Git Workflow

- **Pre-commit hooks**: Husky configured with lint-staged
- **Auto-formatting**: Biome runs on staged files before commit

## Component Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components
  - `ui/` - shadcn/ui components
  - Root-level components (header, providers, theme utilities)
- `src/lib/` - Shared utilities and helpers

## Testing

Currently no test framework is configured in the project.
