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
        ignores: ["**/*.generated.stories.tsx", "**/dist-storybook/**"],
    },
];
