// (C) 2020 GoodData Corporation
module.exports = {
    plugins: ["sonarjs", "eslint-plugin-tsdoc", "regexp"],
    extends: [
        "@gooddata",
        "plugin:import-esm/recommended",
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
