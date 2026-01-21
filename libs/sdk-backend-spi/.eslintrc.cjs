// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-explicit-any": "warn",
        }),
    ],
};
