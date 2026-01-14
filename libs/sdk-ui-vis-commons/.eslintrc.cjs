// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    rules: {
        "@vitest/no-mocks-import": "warn",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-base-to-string": "warn",
        }),
    ],
};
