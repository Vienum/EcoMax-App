import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], // backend code
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 }, // Node + modern JS globals
      ecmaVersion: 2021,
      sourceType: "script", // CommonJS backend
    },
    plugins: { js },
    extends: ["js/recommended", tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-require-imports": "off", // allow require()
    },
  },
]);
