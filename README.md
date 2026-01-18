# Sports Article Service - Fullstack Application

A fullstack monorepo application for managing sports articles using TypeScript, Node.js, Express, Apollo Server v4, Next.js, and PostgreSQL with TypeORM.

## Project Structure

```
/
├── apps/
│   ├── backend/          # GraphQL API Server
│   └── frontend/         # Next.js Frontend Application
├── packages/             # Shared packages (optional)
├── package.json          # Root package.json with workspace scripts
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── docker-compose.yml    # Docker Compose configuration for PostgreSQL
```

## Prerequisites

- **Node.js**: v18 or higher (recommended: v20.x)
- **pnpm**: Install with `npm install -g pnpm`
- **Docker** and **Docker Compose** (optional, for database setup)

## Setup

### 1. Install Dependencies

Install dependencies for all workspaces:

```bash
pnpm install
```

### 2. Database Setup

#### Option A: Using Docker Compose (Recommended)

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 15 container
- Create the `sports_articles` database
- Expose PostgreSQL on port 5432
- Persist data in a Docker volume

To stop the database:

```bash
docker-compose down
```

To stop and remove volumes (⚠️ deletes data):

```bash
docker-compose down -v
```

### 3. Environment Configuration

#### Backend Environment

Copy the example environment file and update with your database credentials:

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=sports_articles
NODE_ENV=development
```

#### Frontend Environment

Copy the example environment file:

```bash
cd apps/frontend
cp .env.example .env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### 4. Database Migrations

Run database migrations to create the tables:

```bash
cd apps/backend
pnpm migration:run
```

### 5. Seed Database (Optional)

Seed the database with sample data from the CSV file:

```bash
cd apps/backend
pnpm seed
```

Or specify a custom CSV file path:

```bash
pnpm seed /path/to/sports-articles.csv
```

The seed script will:
- Check if articles already exist (prevents duplicate seeding)
- Import all articles from the CSV file
- Parse dates and create articles in the database

**Note**: The CSV file should be located at `apps/backend/sports-articles.csv` by default, or you can provide a custom path.

## Running the Application

### Running Backend

Navigate to the backend directory and start the development server:

```bash
cd apps/backend
pnpm dev
```

The GraphQL API will be available at:
- **GraphQL Endpoint**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

### Running Frontend

Navigate to the frontend directory and start the development server:

```bash
cd apps/frontend
pnpm dev
```

The frontend will be available at:
- **Frontend**: http://localhost:3000

### Running Both (Development)

From the root directory, run both applications in parallel:

```bash
pnpm dev
```

This will start both the backend and frontend simultaneously.

## Database Migrations

### Running Migrations

Apply pending migrations:

```bash
cd apps/backend
pnpm migration:run
```

### Reverting Migrations

Revert the last migration:

```bash
cd apps/backend
pnpm migration:revert
```

### Generating Migrations

Generate a new migration based on entity changes:

```bash
cd apps/backend
pnpm migration:generate src/migrations/MigrationName
```

## Seed Instructions

The seed script imports articles from a CSV file into the database.

### Prerequisites

- Database must be set up and migrations must be run
- CSV file should have the following columns: `id`, `title`, `content`, `createdAt`, `imageUrl`

### Running the Seed Script

```bash
cd apps/backend
pnpm seed
```

This will:
1. Connect to the database
2. Check if articles already exist (to prevent duplicate seeding)
3. Read the CSV file from `apps/backend/sports-articles.csv` (or a custom path)
4. Parse and import all articles

### Custom CSV Path

To use a different CSV file:

```bash
pnpm seed /path/to/your/csv/file.csv
```

### CSV Format

The CSV file should have the following format:

```csv
id,title,content,createdAt,imageUrl
1,"Article Title","Article content...",2024-05-01,"https://example.com/image.jpg"
```

**Note**: The `id` column in the CSV is ignored - the database will generate UUIDs automatically.

## Tooling

### ESLint

Lint the codebase:

```bash
# Backend
cd apps/backend
pnpm lint

# Frontend (uses Next.js built-in ESLint)
cd apps/frontend
pnpm lint
```

Fix linting issues automatically:

```bash
cd apps/backend
pnpm lint:fix
```

### Prettier

Format code:

```bash
# Backend
cd apps/backend
pnpm format

# Frontend
cd apps/frontend
pnpm format
```

Check formatting without making changes:

```bash
# Backend
cd apps/backend
pnpm format:check

# Frontend
cd apps/frontend
pnpm format:check
```

## Access Points

- **GraphQL API**: http://localhost:4000/graphql
- **Frontend**: http://localhost:3000
- **Backend Health Check**: http://localhost:4000/health

## Frontend Pages

1. **List Page** (`/`)
   - Displays first 10 articles with SSR
   - Create, Edit, and Delete buttons
   - Responsive grid layout

2. **Article Details** (`/article/[id]`)
   - Full article view with SSR
   - Edit button

3. **Create Article** (`/create`)
   - Form with title, content, and optional image URL
   - Client-side validation
   - Server error handling

4. **Edit Article** (`/edit/[id]`)
   - Pre-filled form with existing article data
   - Client-side validation
   - Server error handling

## GraphQL API

### Queries

#### Get all articles
```graphql
query {
  articles {
    id
    title
    content
    createdAt
    imageUrl
  }
}
```

#### Get article by ID
```graphql
query {
  article(id: "article-id") {
    id
    title
    content
    createdAt
    imageUrl
  }
}
```

### Mutations

#### Create article
```graphql
mutation {
  createArticle(input: {
    title: "Article Title"
    content: "Article content here"
    imageUrl: "https://example.com/image.jpg"
  }) {
    id
    title
    content
    createdAt
    imageUrl
  }
}
```

#### Update article
```graphql
mutation {
  updateArticle(
    id: "article-id"
    input: {
      title: "Updated Title"
      content: "Updated content"
      imageUrl: "https://example.com/new-image.jpg"
    }
  ) {
    id
    title
    content
    createdAt
    imageUrl
  }
}
```

#### Delete article
```graphql
mutation {
  deleteArticle(id: "article-id")
}
```

## Validation

### Backend
- `title` is required and cannot be empty
- `content` is required and cannot be empty
- All validation errors return readable GraphQL error messages with appropriate error codes

### Frontend
- Client-side validation for required fields
- Real-time error display
- Server error handling and display

## Technology Stack

### Backend
- TypeScript
- Node.js + Express
- Apollo Server v4
- PostgreSQL + TypeORM
- GraphQL
- ESLint + Prettier

### Frontend
- TypeScript
- Next.js 14
- Apollo Client
- Tailwind CSS
- React 18
- ESLint + Prettier

## Database Schema

The `SportsArticle` entity includes:
- `id`: UUID (primary key)
- `title`: string (required)
- `content`: string (required)
- `createdAt`: timestamp (auto-generated)
- `deletedAt`: timestamp (for soft deletes, nullable)
- `imageUrl`: string (optional)

## Error Handling

The API returns readable GraphQL errors with appropriate error codes:
- `BAD_USER_INPUT`: Validation errors
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server errors

The frontend displays these errors in a user-friendly format with clear messaging.
