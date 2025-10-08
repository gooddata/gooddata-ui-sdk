// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["plugin:import-esm/recommended", "@gooddata/eslint-config/esm"],
    rules: {
        "no-console": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/await-thenable": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/require-await": "off",
        }),
    ],
};
