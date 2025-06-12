// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    ignorePatterns: ["src/playground/**/*"],
    plugins:  ["react-hooks", "prettier", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import-esm/recommended",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "plugin:react-hooks/recommended",
        "../../.eslintrc.react.js",
        "../../.eslintrc.js",
    ],
    rules: {
        "import/no-unassigned-import": "off",
    },
    parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
};