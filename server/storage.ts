// Storage module - currently using in-memory for mock data
// Auth data is stored in PostgreSQL via Drizzle ORM

import { randomUUID } from "crypto";

// This file is kept for compatibility but auth uses the database directly
export interface IStorage {}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
