# Skill Inventory

A lightweight internal **Skill server platform** for managing and serving reusable Skills
to internal plugins and clients. Built with **Next.js (App Router) + TypeScript +
Tailwind CSS + shadcn/ui + MongoDB (Mongoose)**.

***

## 1. Overview

The platform has two audiences:

| Audience                   | What they do                                 | Entry                      |
| -------------------------- | -------------------------------------------- | -------------------------- |
| Internal staff (admins)    | Create, view, update, publish, delete Skills | Web UI (`/admin`)          |
| Internal plugins / clients | Read published Skill content over HTTP       | JSON API (`/api/public/*`) |

A Skill goes through two lifecycle states:

* **`draft`** — visible and editable only in the admin panel.

* **`published`** — visible to everyone and consumable by plugins/clients via the public API.

***

## 2. Tech Stack

* **Framework**: Next.js 16 (App Router, React 19, Node.js runtime)

* **Language**: TypeScript

* **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova preset)

* **Database**: MongoDB Atlas via Mongoose (cached singleton connection)

* **Icons**: lucide-react

* **Markdown**: react-markdown + remark-gfm

***

## 3. Data Model — `Skill`

Defined in [lib/models/Skill.ts](file:///Users/ouber/github/Skill-Inventory/lib/models/Skill.ts).

| Field         | Type      | Required | Default   | Notes                                                     |
| ------------- | --------- | -------- | --------- | --------------------------------------------------------- |
| `name`        | string    | ✅        | —         | Human-readable name (max 120 chars)                       |
| `slug`        | string    | ✅        | —         | URL-friendly identifier, **globally unique** (kebab-case) |
| `description` | string    | ✅        | —         | Short summary (max 500 chars)                             |
| `content`     | string    | ✅        | —         | Full Skill body (Markdown)                                |
| `category`    | string    | ⬜        | `""`      | e.g. `CRM`, `DevOps`, `Finance`                           |
| `tags`        | string\[] | ⬜        | `[]`      | Free-form tags                                            |
| `version`     | string    | ⬜        | `"1.0.0"` | Semantic version string                                   |
| `status`      | enum      | ⬜        | `"draft"` | `draft` \| `published`                                    |
| `author`      | string    | ⬜        | `""`      | Team or person responsible                                |
| `createdAt`   | Date      | auto     | —         | Mongoose `timestamps`                                     |
| `updatedAt`   | Date      | auto     | —         | Mongoose `timestamps`                                     |

**Database constraints**

* Unique index on `slug` (enforced at the DB level — duplicate writes return HTTP 409).

* Index on `(status, updatedAt desc)` for the published listing query.

* Index on `category`.

***

## 4. API Design

Two namespaces: **admin** (write + full read) and **public** (read-only published content).

### 4.1 Admin API — `/api/skills`

Used by the admin web UI. Write endpoints are protected by an optional `ADMIN_TOKEN`
(see [Configuration](#7-configuration)). When the token is set, requests must include
`x-admin-token: <value>`.

| Method   | Route                     | Description                                                                                 |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `GET`    | `/api/skills`             | List all skills (incl. drafts). Query: `?status=`, `?category=`, `?q=`                      |
| `GET`    | `/api/skills/:id`         | Get one skill by Mongo `_id`                                                                |
| `POST`   | `/api/skills`             | Create a skill. Body: all Skill fields                                                      |
| `PUT`    | `/api/skills/:id`         | Update a skill (partial `$set`, runs validators)                                            |
| `DELETE` | `/api/skills/:id`         | Delete a skill                                                                              |
| `POST`   | `/api/skills/:id/publish` | Toggle/set status. Body `{ "status": "published" \| "draft" }` (optional; flips if omitted) |

**Create / Update body example**

```json
{
  "name": "Customer Lookup",
  "slug": "customer-lookup",
  "description": "Look up a customer by ID, email, or phone",
  "content": "# Customer Lookup\n\nUse this skill to find customer records.",
  "category": "CRM",
  "tags": ["crm", "lookup"],
  "version": "1.1.0",
  "status": "published",
  "author": "growth-team"
}
```

**Responses**

```json
// success
{ "success": true, "data": { ...skill } }

// list
{ "success": true, "data": [ ...skills ], "count": 3 }

// error
{ "success": false, "error": "A skill with this slug already exists" }
```

Status codes: `200` OK, `201` created, `400` validation, `401` unauthorized,
`404` not found, `409` duplicate slug, `500` server error.

### 4.2 Public API — `/api/public/skills`

Consumed by internal plugins and clients. **Only returns** **`published`** **skills.**
No authentication (intended for internal network consumers).

| Method | Route                      | Description                                                      |
| ------ | -------------------------- | ---------------------------------------------------------------- |
| `GET`  | `/api/public/skills`       | List published skills (no `content`). Query: `?category=`, `?q=` |
| `GET`  | `/api/public/skills/:slug` | Get one published skill's full content by slug                   |

The public list endpoint intentionally omits the `content` field and draft skills to
keep the listing lightweight; clients fetch full content via the slug endpoint.

**Example client call**

```bash
# list available skills
curl https://<host>/api/public/skills

# fetch a single skill's full markdown content
curl https://<host>/api/public/skills/customer-lookup
```

***

## 5. Pages (Web UI)

| Route              | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| `/`                | Public home — grid of published Skill cards                                             |
| `/skills/[slug]`   | Public Skill detail — rendered Markdown, metadata, copy button, and the client endpoint |
| `/admin`           | Admin list table — view / edit / publish-toggle / delete                                |
| `/admin/new`       | Create a new Skill (form with live slug generation)                                     |
| `/admin/[id]/edit` | Edit an existing Skill                                                                  |

All pages share a sticky header with links to **Skills** and **Admin**.

***

## 6. Project Structure

```
app/
  api/
    skills/
      route.ts                 # GET list, POST create
      [id]/route.ts            # GET, PUT, DELETE
      [id]/publish/route.ts    # POST toggle status
    public/skills/
      route.ts                 # GET published list (clients)
      [slug]/route.ts          # GET published single (clients)
  skills/[slug]/page.tsx       # public detail
  admin/
    layout.tsx
    page.tsx                   # admin list (client)
    new/page.tsx               # create
    [id]/edit/page.tsx         # edit
  page.tsx                     # home
  layout.tsx
  globals.css
components/
  ui/                          # shadcn/ui components
  site-header.tsx
  skill-card.tsx
  skill-form.tsx
  markdown-view.tsx
lib/
  db.ts                        # cached Mongoose connection
  models/Skill.ts              # Skill schema
  api-client.ts                # typed fetch helper for client components
  auth.ts                      # optional admin token guard
  format.ts                    # slugify + date format
  types.ts                     # shared TS types
  utils.ts                     # cn()
```

***

## 7. Configuration

Environment variables (see [.env.example](file:///Users/ouber/github/Skill-Inventory/.env.example)):

| Variable      | Required | Description                                                                            |
| ------------- | -------- | -------------------------------------------------------------------------------------- |
| `MONGODB_URI` | ✅        | Full MongoDB Atlas connection string                                                   |
| `MONGODB_DB`  | ⬜        | Database name (default `skill_inventory`)                                              |
| `ADMIN_TOKEN` | ⬜        | If set, admin write endpoints require `x-admin-token` header. Leave empty for no auth. |

`.env.local` is gitignored; `.env.example` is committed as a template.

**MongoDB Atlas notes**

* Ensure the Atlas cluster allows network access from the deployment environment (IP
  allowlist or `0.0.0.0/0` for internal use).

* The connection string includes `?appName=Cluster0`; the database name is supplied via
  `MONGODB_DB` in the Mongoose connect options.

***

## 8. Running Locally

```bash
# install dependencies (pnpm)
pnpm install

# create .env.local from the template and fill in credentials
cp .env.example .env.local

# start dev server
pnpm dev
# → http://localhost:3000

# production build & start
pnpm build
pnpm start
```

***

## 9. Notes & Limitations

* **Auth is intentionally lightweight.** The optional `ADMIN_TOKEN` is a shared-secret
  header guard suitable for an internal tool. For production, replace with SSO / session
  auth and role-based access control.

* **Public endpoints are unauthenticated** by design — they only expose `published`
  skills and are meant to be consumed inside the internal network.

* **No pagination** on list endpoints yet (fine for an internal catalog of moderate size).
  Add `limit`/`skip` if the catalog grows large.

