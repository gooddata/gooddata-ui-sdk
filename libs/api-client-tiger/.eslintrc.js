// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "../../.eslintrc.js",
    ],
    parserOptions: { tsconfigRootDir: __dirname },
    rules: {
        "@typescript-eslint/no-namespace": "off",
    },
};
