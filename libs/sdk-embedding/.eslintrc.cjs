// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "sonarjs", "eslint-plugin-tsdoc", "regexp"],
    extends: [
        "@gooddata",
        "plugin:import-esm/recommended",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "../../.eslintrc.js",
    ],
    rules: {
        "@typescript-eslint/no-namespace": "off",
    },
    parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
};
