// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
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
        // this pattern is necessary for typing saga iterator results
        "sonarjs/prefer-immediate-return": "off",
        "react-hooks/rules-of-hooks": 2,
        // "react-hooks/exhaustive-deps": 2,
    },
    parserOptions: { tsconfigRootDir: __dirname },
};
