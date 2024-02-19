// (C) 2022-2024 GoodData Corporation

const LINE_WIDTH = 72;

module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "header-max-length": [2, "always", LINE_WIDTH],
        "body-max-line-length": [2, "always", LINE_WIDTH],
        "footer-max-line-length": [2, "always", LINE_WIDTH],
        "body-leading-blank": [2, "always"],
        "footer-leading-blank": [2, "always"],
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "revert",
                "style",
                "test",
                "config",
                "trivial",
            ],
        ],
    },
    defaultIgnores: false,
};
