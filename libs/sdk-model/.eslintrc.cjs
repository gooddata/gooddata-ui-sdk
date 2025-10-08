// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-implied-eval": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-duplicate-type-constituents": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
        }),
    ],
};
