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
        "plugin:react-hooks/recommended",
        "../../.eslintrc.react.js",
    ],
    parserOptions: { tsconfigRootDir: __dirname },
    globals: {
        fixture: true,
    },
    rules: {
        "import/no-unassigned-import": "off",
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "@storybook/react",
                        importNames: ["storiesOf"],
                        message: "Please use storiesOf from stories/_infra/storyRepository instead.",
                    },
                ],
            },
        ],
    },
};
