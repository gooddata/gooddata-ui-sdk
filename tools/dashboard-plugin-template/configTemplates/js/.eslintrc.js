// (C) 2020 GoodData Corporation
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["react-hooks", "prettier"],
    extends: ["plugin:react/recommended"],
    parserOptions: { tsconfigRootDir: __dirname },
    ignorePatterns: ["webpack.config.js", "jest.setup.js", "scripts/refresh-md.js"],
};
