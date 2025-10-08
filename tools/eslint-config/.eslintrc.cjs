// (C) 2025 GoodData Corporation

const { tsOverride } = require("./src/utils/tsOverride.cjs");

module.exports = {
    extends: ["./dist/esm.json"],
    overrides: [tsOverride(__dirname)],
};
