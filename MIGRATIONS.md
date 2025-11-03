# Database Migrations

This project uses a migration system to manage database schema changes. Migrations are defined in `lib/migrate.ts` and can be run via npm scripts.

## Available Commands

### Run Migrations

Apply all pending migrations:

```bash
npm run migrate
```

**Note:** Make sure to stop your Next.js dev server before running migrations, as the database file will be locked if it's in use.

### Check Migration Status

View which migrations have been applied:

```bash
npm run migrate:status
```

### Rollback a Migration

Rollback a specific migration (if it has a `down` function):

```bash
npm run migrate:rollback <migration-name>
```

Example:
```bash
npm run migrate:rollback 002_add_new_column
```

## Adding New Migrations

To add a new migration, edit `lib/migrate.ts` and add a new migration object to the `migrations` array:

```typescript
{
  name: "002_add_new_column",
  async up(db) {
    await db.execute(`
      ALTER TABLE holidays ADD COLUMN description TEXT;
    `);
  },
  async down(db) {
    await db.execute(`
      ALTER TABLE holidays DROP COLUMN description;
    `);
  },
}
```

**Important:**
- Migration names should be sequential (001, 002, 003, etc.)
- Include a descriptive name after the number
- Always provide a `down` function if possible for rollback support
- Migrations are automatically synced to Turso Cloud after being applied

## Migration Naming Convention

- Use numeric prefixes: `001_`, `002_`, `003_`, etc.
- Use descriptive names: `001_initial_schema`, `002_add_user_email`, etc.
- Keep names lowercase with underscores

## How It Works

1. The `migrations` table tracks which migrations have been applied
2. When you run `npm run migrate`, it checks which migrations are pending
3. Each pending migration is applied in order
4. After successful application, the migration is recorded in the `migrations` table
5. Changes are automatically synced to Turso Cloud

## First Time Setup

If you're setting up a new database, run:

```bash
npm run migrate
```

This will apply the initial schema migration (`001_initial_schema`).

## Troubleshooting

### Database Lock Error

If you get a "database error: Locking error: Failed locking file" error:
- Stop your Next.js dev server (Ctrl+C)
- Run migrations again
- Restart your dev server

### Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

The migration script automatically loads these from `.env` using dotenv.
