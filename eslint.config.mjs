import gitignore from "eslint-config-flat-gitignore";
import { build } from "eslint-config-teppeis";

export default await build({ base: "node18", typescript: true }, gitignore(), {
  files: ["**/*.test.ts"],
  rules: { "@typescript-eslint/ban-ts-comment": "off" },
});
