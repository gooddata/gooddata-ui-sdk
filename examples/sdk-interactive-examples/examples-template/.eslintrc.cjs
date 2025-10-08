// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react"],
    rules: {
        "import/no-unassigned-import": "off",
    },
    overrides: [tsOverride(__dirname)],
};
