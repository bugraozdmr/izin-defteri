import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema", 
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});