// (C) 2022 GoodData Corporation

const LINE_WIDTH = 72;

module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "header-max-length": [2, "always", LINE_WIDTH],
        "body-max-line-length": [2, "always", LINE_WIDTH],
        "footer-max-line-length": [2, "always", LINE_WIDTH],
        "body-leading-blank": [2, "always"],
        "footer-leading-blank": [2, "always"],
    },
    helpUrl: "https://github.com/gooddata/gdc-analytical-designer/blob/develop/CONTRIBUTING.md#commits",
    defaultIgnores: false,
};
