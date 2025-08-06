// (C) 2020-2025 GoodData Corporation
module.exports = {
    plugins: ["sonarjs", "eslint-plugin-tsdoc", "regexp"],
    extends: [
        "@gooddata",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "../../.eslintrc.js",
    ],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
        },
    ],
};
