// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm"],
    rules: {
        "import/export": "off",
    },
    overrides: [tsOverride(__dirname)],
};
