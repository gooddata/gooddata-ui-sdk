// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "sonarjs", "eslint-plugin-tsdoc", "regexp"],
    extends: [
        "@gooddata",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "../../.eslintrc.js",
    ],
    parserOptions: { tsconfigRootDir: __dirname },
};
