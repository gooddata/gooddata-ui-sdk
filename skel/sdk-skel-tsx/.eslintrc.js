// (C) 2020-2025 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/react"],
    overrides: [tsOverride(__dirname)],
};
