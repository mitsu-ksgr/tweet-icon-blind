/**
 * eslint.config.js
 *
 * - https://eslint.org/docs/latest/use/configure/
 */

import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      globals: {
        browser: true,
        node: true,
        es2022: true,

        // no-undef
        console: "readonly",
        document: "readonly",
        localStorage: "readonly",
        window: "readonly",
      },
    },
  },
  {
    rules: {
      ...eslint.configs.recommended.rules,
      ...prettier.rules,
    },
  },
  {
    ignores: [
      "node_modules/",
      "/build",
      "/package",

      // Ingroe env files
      ".env",
      ".env.*",

      // Ignore files for PNPM, NPM, Yarn
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },
];
