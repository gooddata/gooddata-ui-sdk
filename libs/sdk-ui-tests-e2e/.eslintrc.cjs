// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/react-cypress"],
    rules: {
        "import/no-unassigned-import": "off",
        "import/namespace": "off",
        "no-console": "off",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            },
        },
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "eslint-comments/no-unused-disable": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/prefer-promise-reject-errors": "off",
            "@typescript-eslint/no-floating-promises": "off",
        }),
    ],
};
