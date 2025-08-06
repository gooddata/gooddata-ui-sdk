// (C) 2020 GoodData Corporation
module.exports = {
    plugins: ["react-hooks", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import/errors",
        "plugin:import/typescript",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "plugin:react-hooks/recommended",
        "../../.eslintrc.react.js",
    ],
    rules: {
        "import/no-unassigned-import": "off",
        "no-console": "off",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            },
        },
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
        },
    ],
};
