// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest-storybook";

export default [
    ...config,
    {
        languageOptions: {
            globals: {
                fixture: true,
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        rules: {
            "import-x/no-unassigned-import": "warn",
        },
    },
    {
        ignores: ["**/*.generated.stories.tsx", "**/dist-storybook/**"],
    },
];
