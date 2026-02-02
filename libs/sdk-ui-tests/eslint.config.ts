// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest-storybook";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    {
        languageOptions: {
            globals: {
                fixture: true,
            },
        },
    },
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
    }),
    {
        rules: {
            "import-x/no-unassigned-import": "warn",
        },
    },
    {
        ignores: ["**/*.generated.stories.tsx", "**/dist-storybook/**"],
    },
];
