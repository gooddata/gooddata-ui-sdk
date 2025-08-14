// (C) 2020-2025 GoodData Corporation
module.exports = {
    plugins: ["react-hooks", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import-esm/recommended",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "plugin:react-hooks/recommended",
        "../../.eslintrc.react.js",
    ],
    rules: {
        "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true }],
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
        },
    ],
};
