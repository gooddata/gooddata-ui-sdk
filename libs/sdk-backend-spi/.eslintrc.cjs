// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm"],
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/naming-convention": "off",
        }),
    ],
};
