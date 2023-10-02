import { build } from "eslint-config-teppeis";

export default await build(
  { base: "node18", typescript: true },
  {
    ignores: ["dist", "coverage"],
  },
  {
    files: ["**/*.test.ts"],
    rules: { "@typescript-eslint/ban-ts-comment": "off" },
  },
);
