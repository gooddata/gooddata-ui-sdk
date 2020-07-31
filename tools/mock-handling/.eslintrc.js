// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier"],
    extends: [
        "@gooddata",
        "plugin:react/recommended",
        "plugin:import/errors",
        "plugin:import/typescript",
        "../../.eslintrc.js",
    ],
    parserOptions: { tsconfigRootDir: __dirname, project: "./tsconfig.json" },
    rules: {
        "no-console": "off",
    },
};
