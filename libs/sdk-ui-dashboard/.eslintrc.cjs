// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    rules: {
        "import/export": "off",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "eslint-comments/no-unused-disable": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/only-throw-error": "off",
            "@typescript-eslint/await-thenable": "off",
        }),
    ],
};
