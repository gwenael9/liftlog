import { config } from "dotenv";
import { resolve } from "path";
import { Client } from "pg";

export default async function globalSetup() {
  config({ path: resolve(__dirname, "../../.env") });
  const dbName = process.env.DATABASE_NAME
    ? `${process.env.DATABASE_NAME}_test`
    : "liftlog_test";
  const client = new Client({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER || "liftlog",
    password: process.env.DATABASE_PASSWORD || "liftlog_password",
    database: "postgres",
  });

  await client.connect();
  const { rowCount } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName],
  );
  if (rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }
  await client.end();
}
