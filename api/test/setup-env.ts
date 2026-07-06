import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

process.env.NODE_ENV = "test";
process.env.DATABASE_NAME = process.env.DATABASE_NAME
  ? `${process.env.DATABASE_NAME}_test`
  : "liftlog_test";
