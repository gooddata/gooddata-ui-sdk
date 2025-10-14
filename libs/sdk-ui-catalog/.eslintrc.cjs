// (C) 2020-2025 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true }],
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-duplicate-type-constituents": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-floating-promises": "off",
        }),
    ],
};
