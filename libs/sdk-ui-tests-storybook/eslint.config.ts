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
        files: ["**/*.stories.tsx"],
        rules: {
            "no-restricted-exports": "off",
        },
    },
    {
        files: ["**/*.generated.stories.tsx"],
        rules: {
            "storybook/prefer-pascal-case": "off",
        },
    },
];
