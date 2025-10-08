// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm-react"],
    rules: {
        "import/no-unassigned-import": "off",
        "no-unused-vars": "off",
        "react/function-component-definition": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unsafe-assignments": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        }),
    ],
    ignorePatterns: [
        "webpack.config.cjs",
        "scripts/refresh-md.js",
        "configTemplates/ts/vite.config.ts",
        "configTemplates/js/vite.config.js",
    ],
};
