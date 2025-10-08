// (C) 2024 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react-vitest"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/require-await": "off",
        }),
    ],
};
