// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm-react"],
    rules: {
        "import/no-unassigned-import": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-member-access": "warn",
        }),
    ],
    ignorePatterns: [
        "webpack.config.cjs",
        "scripts/refresh-md.js",
        "configTemplates/ts/vite.config.ts",
        "configTemplates/js/vite.config.js",
    ],
};
