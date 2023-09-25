// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier", "sonarjs"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "plugin:react-hooks/recommended",
        "../../.eslintrc.react.js",
    ],
    rules: {
        "tsdoc/syntax": "off",
        "import/no-unassigned-import": "off",
    },
    parserOptions: { tsconfigRootDir: __dirname },
};
