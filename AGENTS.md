# AGENTS.md - AI Coding Assistant Guidelines

Project guidelines for AI assistants working in this repository.

## Project Overview

This is a **Turborepo monorepo** with pnpm workspaces containing:

- `apps/web`: React + Vite frontend with Tailwind CSS and shadcn/ui
- `apps/server`: Hono + Cloudflare Workers backend with Drizzle ORM
- `packages/ui`: Shared React component library
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

## Build, Lint, and Type Check Commands

Run from repository root:

```bash
# Install dependencies
pnpm install

# Build all apps and packages
pnpm run build
# Or: turbo run build

# Build specific app
pnpm run build --filter=web
pnpm run build --filter=server

# Start development (runs all apps)
pnpm run dev
# Or: turbo run dev

# Run linting on all packages
pnpm run lint
# Or: turbo run lint

# Run type checking on all packages
pnpm run check-types
# Or: turbo run check-types

# Format code with Prettier
pnpm run format
```

### App-Specific Commands

**Web app (`apps/web/`):**

```bash
cd apps/web
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

**Server app (`apps/server/`):**

```bash
cd apps/server
pnpm dev          # Start Wrangler dev server
pnpm deploy       # Deploy to Cloudflare
pnpm db:push      # Push Drizzle schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm cf-typegen   # Generate Cloudflare types
```

**Note:** This project currently has **no test framework configured**.

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2022 with strict mode enabled
- **Module System**: NodeNext (ES modules)
- **JSX**: react-jsx transform (no React import needed)
- **Path Aliases**: Use `@/` for project imports (e.g., `@/components`, `@/lib/utils`)

### Imports

- Use ES module imports with `.js` extension for local files (even for TypeScript)
- Group imports: external libraries first, then internal aliases, then relative imports
- Use `type` imports when importing types only: `import type { Foo } from "./foo"`

```typescript
// Good
import { Hono } from "hono";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.js";
```

### Formatting

- **Semicolons**: Optional (not enforced)
- **Quotes**: Double quotes for strings
- **Trailing commas**: Use trailing commas in multiline objects/arrays
- **Indentation**: 2 spaces
- **Max line length**: Prettier defaults

### Naming Conventions

- **Components**: PascalCase (e.g., `Button`, `UserCard`)
- **Functions**: camelCase (e.g., `getAuth`, `cn`)
- **Variables**: camelCase (e.g., `userId`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `API_URL`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `VariantProps`, `UserSchema`)
- **File names**: kebab-case for components (e.g., `alert-dialog.tsx`), camelCase for utilities (e.g., `utils.ts`)
- **Database tables**: snake_case (e.g., `user`, `session`, `account`)

### Component Patterns

**React Components:**

- Use function declarations for components (not arrow functions)
- Destructure props in function parameters
- Use `class-variance-authority` (cva) for component variants
- Always export component and its variants/types

```typescript
// Example from button.tsx
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

### Type Safety

- Enable `strict: true` in all tsconfig files
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` with type guards instead
- Use TypeScript's strict null checks
- Leverage Drizzle ORM's type inference for database operations

### Error Handling

- Use Effect for structured error handling in the server app
- For Hono routes, return appropriate HTTP status codes
- Use early returns to reduce nesting
- Database operations should use Drizzle's type-safe queries

```typescript
// Good - early return pattern
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Database with type safety
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});
```

### Styling with Tailwind CSS

- Use Tailwind CSS v4 with `@tailwindcss/vite`
- Component styles defined via `cva` (class-variance-authority)
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Follow shadcn/ui conventions for variant naming (`default`, `outline`, `ghost`, etc.)
- Support dark mode via CSS variables

### ESLint Rules

- All warnings (not errors) via `eslint-plugin-only-warn`
- React Hooks rules enabled
- React Refresh rules for Vite
- Prettier integration for formatting
- Turbo plugin for undeclared env var detection

### Database Schema (Drizzle ORM)

- Use snake_case for column names in PostgreSQL tables
- Always define indexes for foreign keys and frequently queried fields
- Use `defaultNow()` for timestamp defaults
- Implement `$onUpdate()` for automatic updatedAt timestamps
- Define relations using Drizzle's relations API

```typescript
// Example pattern from auth-schema.ts
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // ...
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);
```

### Monorepo Best Practices

- Use `workspace:*` protocol for internal package dependencies
- Share configurations via `@repo/eslint-config` and `@repo/typescript-config`
- Keep app-specific configurations in their respective directories
- Use Turbo's filtering for running tasks on specific apps/packages

## Additional Resources

- **Tambo AI**: The web app uses Tambo AI for AI-driven UI. See `apps/web/AGENTS.md` and `apps/web/src/components/tambo/AGENTS.md` for Tambo-specific guidelines.
- **shadcn/ui**: Components follow the base-lyra style. See `apps/web/components.json` for configuration.
