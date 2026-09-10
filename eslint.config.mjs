import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored third-party source (pixel-point/toolcraft, MIT). Kept as-is so it
    // can be re-diffed against upstream; it does not satisfy the React Compiler
    // lint rules that eslint-config-next enables.
    "src/toolcraft/**",
  ]),
]);

export default eslintConfig;
