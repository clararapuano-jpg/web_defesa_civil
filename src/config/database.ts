import { Pool } from "pg";
import "dotenv/config"; // Adicione essa linha explicitamente aqui no topo

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});