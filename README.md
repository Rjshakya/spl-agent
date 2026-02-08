# ASK DB - AI-Powered Database Query Assistant

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-purple?logo=vite" alt="Vite 7">
  <img src="https://img.shields.io/badge/Hono-4.11-orange" alt="Hono">
  <img src="https://img.shields.io/badge/Tambo-AI-green" alt="Tambo AI">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL">
</p>

<p align="center">
  <b>Chat with your database using natural language. No SQL required.</b>
</p>

---

## ✨ What is ASK DB ?

ASK DB is an intelligent web application that transforms how users interact with PostgreSQL databases. Instead of writing complex SQL queries manually, users can simply ask questions in plain English and receive:

- **Auto-generated SQL queries** tailored to your database schema
- **Query results** displayed in beautiful, interactive data tables
- **Automatic visualizations** (bar charts, line charts) based on data structure
- **Read-only safety** - only SELECT queries are allowed

Whether you're a data analyst, developer, or business user, SQL Agent makes database exploration as simple as having a conversation.

---

## 🚀 Key Features

| Feature                            | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| **💬 Natural Language to SQL**     | Ask questions like "Show me total sales by month" - AI handles the rest |
| **🤖 AI-Powered Generation**       | Uses MoonshotAI's Kimi K2.5 model for intelligent query generation      |
| **🔍 Auto Database Introspection** | Automatically discovers tables, columns, and relationships              |
| **🛡️ Read-Only Safety**            | Enforces SELECT-only queries; blocks INSERT/UPDATE/DELETE/DROP          |
| **📊 Smart Visualizations**        | Auto-detects and renders charts (bar/line) or tables based on data      |
| **✅ Query Testing**               | AI validates SQL before execution with LIMIT safety                     |
| **💾 Connection Management**       | Save and manage multiple PostgreSQL connections                         |
| **⚡ Streaming Responses**         | Real-time AI response streaming in chat interface                       |
| **🔒 Secure Authentication**       | JWT-based auth with OAuth support (Google)                              |
| **🎨 Modern UI**                   | Built with shadcn/ui, Tailwind CSS, and dark/light themes               |

---

## 🛠️ Tech Stack

### Frontend (`apps/web/`)

| Technology          | Purpose                 | Version |
| ------------------- | ----------------------- | ------- |
| **React 19**        | UI framework            | 19.2.0  |
| **Vite 7**          | Build tool & dev server | 7.2.4   |
| **TypeScript**      | Type safety             | 5.9.3   |
| **Tailwind CSS v4** | Utility-first styling   | 4.1.17  |
| **shadcn/ui**       | Component library       | 3.8.2   |
| **Tambo AI**        | Generative UI framework | 0.75.0  |
| **Recharts**        | Data visualization      | 2.15.4  |
| **React Router v7** | Client-side routing     | 7.13.0  |
| **Zustand**         | State management        | 5.0.11  |
| **Zod**             | Schema validation       | 4.3.6   |
| **Better Auth**     | Authentication client   | 1.4.18  |

### Backend (`apps/server/`)

| Technology             | Purpose                                 | Version               |
| ---------------------- | --------------------------------------- | --------------------- |
| **Hono**               | Lightweight web framework               | 4.11.7                |
| **Cloudflare Workers** | Edge runtime                            | Wrangler 4.63.0       |
| **Drizzle ORM**        | Type-safe database ORM                  | 0.45.1                |
| **Effect**             | Functional programming & error handling | 3.19.15               |
| **Vercel AI SDK**      | AI/LLM integration                      | 6.0.69                |
| **OpenRouter**         | LLM provider gateway                    | AI SDK Provider 2.1.1 |
| **Better Auth**        | Authentication server                   | 1.4.18                |
| **PostgreSQL**         | Primary database                        | via node-postgres     |

### AI/LLM

- **Primary Model**: MoonshotAI/Kimi K2.5 (via OpenRouter)
- **Framework**: Vercel AI SDK with ToolLoopAgent
- **Context Gathering**: Sub-agent architecture for schema exploration
- **Query Testing**: Self-testing agents that validate SQL before returning

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   React App     │  │  TamboProvider  │  │   Chat Interface        │  │
│  │   (Vite)        │  │   (@tambo-ai)   │  │   (Generative UI)       │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘  │
│           │                    │                                         │
│           │                    │ Registers:                              │
│           │                    │ - Components (SqlResults, DataChart)    │
│           │                    │ - Tools (executeSql, generateSql, etc.) │
│           │                    │                                         │
└───────────┼────────────────────┼─────────────────────────────────────────┘
            │                    │
            │ HTTP/WebSocket     │ Tool Calls
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         Hono Server                              │    │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │    │
│  │  │ /api/auth   │ │ /api/tools   │ │ /api/connection          │  │    │
│  │  │ (BetterAuth)│ │  - generate  │ │  - CRUD operations       │  │    │
│  │  │             │ │  - execute   │ │                          │  │    │
│  │  │             │ │  - getTables │ │                          │  │    │
│  │  │             │ │  - getColumns│ │                          │  │    │
│  │  └─────────────┘ └──────────────┘ └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                    │
│                                    │ Uses Effect.ts for error handling  │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI/AGENT LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    SQL Generator Workflow                        │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │    │
│  │  │Context Agent │───▶│  SQL Agent   │───▶│  Query Testing   │  │    │
│  │  │              │    │  (ToolLoop)  │    │  (Auto-retry)    │  │    │
│  │  │- getTables   │    │- generateSQL │    │- Execute w/LIMIT │  │    │
│  │  │- getColumns  │    │- testQuery   │    │- Validate result │  │    │
│  │  │- getContext  │    │- getContext  │    │- Return/Retry    │  │    │
│  │  └──────────────┘    └──────────────┘    └──────────────────┘  │    │
│  │                                                                  │    │
│  │  LLM: moonshotai/kimi-k2.5 via OpenRouter                        │    │
│  │  Prompt: apps/server/src/prompts/sql-generator-prompts.ts       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
│  ┌──────────────────────────┐      ┌─────────────────────────────────┐  │
│  │    App Database          │      │    User Connections (Dynamic)   │  │
│  │  (PostgreSQL on Neon)    │      │  (User-provided PostgreSQL DBs) │  │
│  │                          │      │                                 │  │
│  │  - users table           │      │  - Any PostgreSQL database      │  │
│  │  - sessions table        │      │  - Discovered at runtime        │  │
│  │  - connections table     │      │  - Read-only access enforced    │  │
│  │  - user_files table      │      │                                 │  │
│  └──────────────────────────┘      └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User asks** a question in natural language via chat
2. **Tambo AI** decides which tools to call
3. **Context Agent** explores database schema (tables, columns, relationships)
4. **SQL Agent** generates query using context + natural language
5. **Test Agent** validates query with `LIMIT 1` execution
6. **Query Executor** runs validated query with `LIMIT 20` safety
7. **Visualization Service** determines best display format (table/chart)
8. **Tambo Component** renders result (SqlResults or DataChart)
9. **UI** displays streaming response with results

---

## 📁 Project Structure

```
sql-agent/
├── apps/
│   ├── web/                          # React Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── chat-interface.tsx      # Main chat UI
│   │   │   │   ├── chat-input.tsx          # Message input
│   │   │   │   ├── ui/                     # shadcn/ui components
│   │   │   │   └── tambo/                  # Tambo generative components
│   │   │   │       ├── sql-results.tsx     # Data table component
│   │   │   │       ├── data-chart.tsx      # Chart visualization
│   │   │   │       └── query-permission-box.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ChatPage.tsx            # Chat route with thread support
│   │   │   │   ├── ConnectionsPage.tsx     # Connection management
│   │   │   │   ├── HomePage.tsx            # Dashboard home
│   │   │   │   └── LoginPage.tsx           # Authentication
│   │   │   ├── providers/
│   │   │   │   └── tambo-provider.tsx      # Tambo configuration
│   │   │   ├── tools/                      # Tambo AI tools
│   │   │   │   ├── execute-sql.ts          # Execute SQL queries
│   │   │   │   ├── generate-sql.ts         # Generate SQL from NL
│   │   │   │   ├── generate-sql-workflow.ts # Full generation workflow
│   │   │   │   ├── get-database-context.ts # Get schema context
│   │   │   │   ├── get-database-tables.ts  # List tables
│   │   │   │   └── get-table-columns.ts    # Get column info
│   │   │   ├── store/
│   │   │   │   └── connection-store.ts     # Zustand state
│   │   │   ├── routes/
│   │   │   │   └── index.tsx               # React Router config
│   │   │   └── lib/
│   │   │       ├── auth-client.ts
│   │   │       └── env.ts
│   │   └── package.json
│   │
│   └── server/                       # Hono Backend
│       ├── src/
│       │   ├── app.ts                      # Main Hono app
│       │   ├── routes/
│       │   │   ├── api.ts                  # Route aggregator
│       │   │   ├── connection.ts           # Connection CRUD
│       │   │   ├── tools.ts                # AI tools endpoints
│       │   │   ├── generate.ts             # SQL generation
│       │   │   └── execute.ts              # SQL execution
│       │   ├── services/
│       │   │   ├── sql-query-generator.ts  # AI SQL generation
│       │   │   ├── context-service.ts      # Schema discovery
│       │   │   ├── connections.ts          # Connection management
│       │   │   └── query-executor.ts       # Safe query execution
│       │   ├── workflows/
│       │   │   ├── sql-generator.ts        # Generation workflow
│       │   │   └── sql-executor.ts         # Execution workflow
│       │   ├── lib/
│       │   │   ├── auth.ts                 # Better Auth setup
│       │   │   ├── context-tools.ts        # DB introspection SQL
│       │   │   ├── openrouter.ts           # AI provider
│       │   │   └── data-sources.ts
│       │   ├── db/
│       │   │   ├── instance.ts             # DB connection factory
│       │   │   └── schema/
│       │   │       ├── auth-schema.ts      # User/session tables
│       │   │       ├── connections.ts      # Connection storage
│       │   │       └── user-files.ts
│       │   └── prompts/
│       │       ├── sql-generator-prompts.ts
│       │       └── context-service-prompts.ts
│       └── package.json
│
├── packages/                         # Shared packages
│   ├── ui/                          # UI component library
│   ├── eslint-config/               # Shared ESLint config
│   └── typescript-config/           # Shared TS config
│
├── turbo.json                        # Turborepo config
└── package.json                      # Root package
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** database (for app data)
- API keys for:
  - [Tambo AI](https://console.tambo.co)
  - [OpenRouter](https://openrouter.ai)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/sql-agent.git
   cd sql-agent
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   **Backend** (`apps/server/.env`):

   ```env
   OPEN_ROUTER_API_KEY=...
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   BETTER_AUTH_SECRET=your_random_secret_here
   BETTER_AUTH_URL=http://localhost:8000
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend** (`apps/web/.env.local`):

   ```env
   VITE_TAMBO_API_KEY=your_tambo_api_key
   VITE_BACKEND_URL=http://localhost:8000
   VITE_URL=http://localhost:3000
   ```

4. **Push database schema**

   ```bash
   cd apps/server
   pnpm db:push
   ```

5. **Start development servers**

   Terminal 1 (Backend):

   ```bash
   cd apps/server
   pnpm dev
   ```

   Terminal 2 (Frontend):

   ```bash
   cd apps/web
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📝 Usage Examples

Ask questions like:

- "How many users do we have?"
- "Show me user signups over the last 30 days"
- "What percentage of users have verified emails?"
- "List the 10 most recent users with their email domains"
- "Show me daily signups as a bar chart"

The AI will:

1. Explore your database schema
2. Generate the appropriate SQL query
3. Test it with LIMIT 1
4. Execute it safely with LIMIT 20
5. Render results in a table or chart

---

## 🔒 Security Features

- **Read-Only Enforcement**: Only SELECT queries allowed; blocks INSERT/UPDATE/DELETE/DROP
- **Query Limits**: Auto-adds `LIMIT 20` to all queries
- **Query Testing**: AI tests with `LIMIT 1` before returning to user
- **Authentication**: JWT-based sessions with secure httpOnly cookies
- **Input Validation**: Zod schemas for all API endpoints
- **Type Safety**: Full TypeScript with Drizzle ORM

---

## 🛠️ Available Scripts

```bash
# Install dependencies
pnpm install

# Build all apps and packages
pnpm run build

# Start development (runs all apps)
pnpm run dev

# Run linting
pnpm run lint

# Run type checking
pnpm run check-types

# Format code
pnpm run format

# Backend specific
cd apps/server
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm deploy       # Deploy to Cloudflare

# Frontend specific
cd apps/web
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

---

## 📚 Key Dependencies

### Core

- [Tambo AI](https://tambo.co) - Generative UI framework
- [Vercel AI SDK](https://sdk.vercel.ai) - AI tooling
- [Hono](https://hono.dev) - Web framework
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Better Auth](https://better-auth.com) - Authentication
- [shadcn/ui](https://ui.shadcn.com) - UI components

### Visualization

- [Recharts](https://recharts.org) - React charting

### State Management

- [Zustand](https://zustand-demo.pmnd.rs) - State management
- [TanStack Query](https://tanstack.com/query) - Data fetching (via Tambo)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Tambo AI](https://tambo.co) for the generative UI framework
- [MoonshotAI](https://moonshot.ai) for the Kimi K2.5 model
- [OpenRouter](https://openrouter.ai) for LLM API access
- [Cloudflare](https://cloudflare.com) for edge computing infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library

---

<p align="center">
  Built with ❤️ using React, Hono, Tambo AI, and Cloudflare Workers
</p>
