// (C) 2020 GoodData Corporation
module.exports = {
    plugins: ["react-hooks", "sonarjs", "eslint-plugin-tsdoc"],
    extends: [
        "@gooddata",
        "plugin:import-esm/recommended",
        "plugin:sonarjs/recommended",
        "plugin:regexp/recommended",
        "../../.eslintrc.js",
    ],
    rules: {
        "import/no-unassigned-import": "off",
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
        },
    ],
    ignorePatterns: [
        "webpack.config.cjs",
        "scripts/refresh-md.js",
        "configTemplates/ts/vite.config.ts",
        "configTemplates/js/vite.config.js",
    ],
};
