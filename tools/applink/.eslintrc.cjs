// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm"],
    rules: {
        "no-console": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/naming-convention": "off",
        }),
    ],
};
