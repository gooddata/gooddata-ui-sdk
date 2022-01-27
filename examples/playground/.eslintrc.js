// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    ignorePatterns: ["src/playground/**/*"],
    plugins: ["react-hooks", "prettier", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "../../.eslintrc.react.js",
    ],
    rules: {
        "no-warning-comments": "error",
    },
    parserOptions: { tsconfigRootDir: __dirname },
};
