// (C) 2025 GoodData Corporation

module.exports = {
    tsOverride: (__dirname, rules = {}) => {
        return {
            files: ["**/*.ts", "**/*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: { tsconfigRootDir: __dirname, project: "tsconfig.json" },
            rules,
            settings: {
                "import/resolver": {
                    node: {
                        extensions: [".js", ".ts"],
                    },
                    typescript: {
                        alwaysTryTypes: true,
                        project: "./tsconfig.json",
                    },
                },
            },
        };
    },
};
