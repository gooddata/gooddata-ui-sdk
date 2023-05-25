// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier", "sonarjs", "eslint-plugin-tsdoc"],
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
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    },
};
