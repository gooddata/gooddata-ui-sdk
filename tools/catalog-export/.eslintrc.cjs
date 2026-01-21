// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm"],
    rules: {
        "no-console": "warn",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        }),
    ],
};
