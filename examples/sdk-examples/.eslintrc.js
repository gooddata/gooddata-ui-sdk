// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier", "sonarjs", "eslint-plugin-tsdoc"],
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
        "no-warning-comments": "error",
        "import/no-unassigned-import": "off",
        "react/no-unknown-property": [
            "error",
            {
                ignore: [
                    "jsx", // this is for styled-jsx
                ],
            },
        ],
    },
    parserOptions: { tsconfigRootDir: __dirname },
};
