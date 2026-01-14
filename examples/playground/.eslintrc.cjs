// (C) 2020-2026 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/esm-react"],
    rules: {
        "import/no-unassigned-import": "warn",
    },
    overrides: [
        tsOverride(__dirname, {
            "@typescript-eslint/no-unsafe-assignment": "warn",
        }),
    ],
};
