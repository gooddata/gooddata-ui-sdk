// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/require-await": "off",
        }),
    ],
};
