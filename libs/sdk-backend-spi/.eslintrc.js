// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["prettier"],
    extends: ["@gooddata", "plugin:import/errors", "plugin:import/typescript", "../../.eslintrc.js"],
    parserOptions: { tsconfigRootDir: __dirname },
};
