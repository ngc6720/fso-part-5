import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    ignores: ["dist/"],
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      eqeqeq: "error",
      "no-unused-vars": ["warn"],
      "arrow-spacing": ["warn", { before: true, after: true }],
      "object-curly-spacing": ["warn", "always"],
      "no-trailing-spaces": "warn",
    },
  },
];
