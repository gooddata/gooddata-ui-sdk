// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/v10/oxlint/esm-react-storybook";

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
        files: ["**/*.generated.stories.tsx"],
        rules: {
            "storybook/prefer-pascal-case": "off",
        },
    },
];
