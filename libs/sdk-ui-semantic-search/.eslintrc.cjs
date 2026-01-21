// (C) 2024-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        }),
    ],
};
