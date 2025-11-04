import { createClient } from '@libsql/client';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string
});

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
	if (db) {
		return db;
	}

	db = drizzle({ client, schema });
	return db;
}
