// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-duplicate-type-constituents": "off",
            "@typescript-eslint/prefer-promise-reject-errors": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
        }),
    ],
};
