/** @type {import('eslint').Linter.BaseConfig & { ignorePatterns: string[] }} */
const config = {
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "unicorn", "prettier"],
  ignorePatterns: require("node:fs")
    .readFileSync(".gitignore", "utf8")
    .split("\n")
    .map((line) => line.split("#")[0].trim())
    .filter((withoutComment) => withoutComment.length > 0),
  rules: {
    "arrow-body-style": "off",
    "no-array-constructor": "off",
    "no-console": "error",
    "no-empty": ["error", { allowEmptyCatch: true }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^(_|error$)",
      },
    ],
    "@typescript-eslint/no-array-constructor": ["error"],
    "@typescript-eslint/no-explicit-any": ["warn"],
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "unicorn/prevent-abbreviations": [
      "error",
      {
        extendDefaultReplacements: false,
        replacements: {
          def: { defer: true, deferred: true, define: true, definition: true },
          dir: { direction: true, directory: true },
          docs: { documentation: true, documents: true },
          dst: { daylightSavingTime: true, destination: true, distribution: true },
          e: { error: true, event: true },
          rel: { related: true, relationship: true, relative: true },
          res: { response: true, result: true },
        },
      },
    ],
    "unicorn/no-array-reduce": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-new-array": "off",

    // project specific
    "unicorn/prefer-code-point": "off",
    "unicorn/prefer-string-replace-all": "off",
    "unicorn/prefer-switch": "off",
    "unicorn/prefer-at": "off",
    "unicorn/prefer-ternary": ["error", "only-single-line"],
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-node-protocol": "off",
  },
  overrides: [
    {
      files: ["*.cjs"],
      rules: {
        "unicorn/prefer-module": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: [".scripts/**/*.ts"],
      rules: {
        "no-console": "off",
        "unicorn/no-process-exit": "off",
      },
    },
    {
      files: ["lib/**/*.ts"],
      extends: ["plugin:security/recommended"],
      overrides: [
        {
          files: ["lib/**/*.test.ts"],
          rules: {
            "security/detect-unsafe-regex": 0,
            "security/detect-non-literal-regexp": 0,
            "security/detect-non-literal-require": 0,
            "security/detect-non-literal-fs-filename": 0,
            "security/detect-eval-with-expression": 0,
            "security/detect-pseudoRandomBytes": 0,
            "security/detect-possible-timing-attacks": 0,
            "security/detect-no-csrf-before-method-override": 0,
            "security/detect-buffer-noassert": 0,
            "security/detect-child-process": 0,
            "security/detect-disable-mustache-escape": 0,
            "security/detect-object-injection": 0,
            "security/detect-new-buffer": 0,
            "security/detect-bidi-characters": 0,
          },
        },
      ],
    },
  ],
};

module.exports = config;
