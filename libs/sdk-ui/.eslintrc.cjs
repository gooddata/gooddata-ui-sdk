// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    rules: {
        "import/export": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-floating-promises": "off",
            "eslint-comments/no-unused-disable": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/prefer-promise-reject-errors": "off",
        }),
    ],
};
