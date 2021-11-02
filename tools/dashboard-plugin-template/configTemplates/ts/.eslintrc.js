// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier"],
    extends: ["plugin:react/recommended", "plugin:import/errors", "plugin:import/typescript"],
    parserOptions: { tsconfigRootDir: __dirname },
};
