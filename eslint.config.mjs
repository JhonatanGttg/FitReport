import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "build/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "src/db/**",
  ]),
]);
