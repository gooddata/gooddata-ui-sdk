// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm"],
    rules: {
        "no-console": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
        }),
    ],
};
