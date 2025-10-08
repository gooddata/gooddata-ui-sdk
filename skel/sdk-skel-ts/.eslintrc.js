// (C) 2020-2025 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata"],
    overrides: [tsOverride(__dirname)],
};
