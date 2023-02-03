// eslint-disable-next-line no-undef
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "semi": "warn",
    "comma-dangle": "off",
    "@typescript-eslint/indent": ["warn", 2],
    "@typescript-eslint/brace-style": ["warn", "1tbs", { allowSingleLine: true }],
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }],
    "@typescript-eslint/member-delimiter-style": "warn",
    "eqeqeq": "warn",
    "no-trailing-spaces": "warn",
    "eol-last": "warn",
    "guard-for-in": "warn",
    "@typescript-eslint/quotes": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/comma-dangle": ["warn", "always-multiline"],
  },
};
