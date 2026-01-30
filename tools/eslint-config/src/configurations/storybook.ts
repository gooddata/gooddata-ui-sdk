// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const storybookPlugin: IPackage = {
    name: "eslint-plugin-storybook",
    version: "10.1.11",
};

const packages = [
    storybookPlugin,
    {
        // peer
        name: "storybook",
        version: "^10.1.11",
    },
    {
        // peer
        name: "@testing-library/dom",
        version: "10.4.1",
    },
    {
        // peer
        name: "react",
        version: "19.1.1",
    },
    {
        // peer
        name: "react-dom",
        version: "19.1.1",
    },
];

export const storybook: IDualConfiguration<"storybook", ""> = {
    v8: {
        packages,
        plugins: ["storybook"],
        overrides: [
            {
                files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)", "**/*.story.@(ts|tsx|js|jsx|mjs|cjs)"],
                extends: ["plugin:storybook/recommended"],
                rules: {
                    "storybook/prefer-pascal-case": "error",
                },
            },
        ],
    },
    v9: {
        packages,
        plugins: { storybook: storybookPlugin },
        overrides: [
            {
                files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)", "**/*.story.@(ts|tsx|js|jsx|mjs|cjs)"],
                rules: {
                    "react-hooks/rules-of-hooks": "off",
                    "import/no-anonymous-default-export": "off",
                    "storybook/await-interactions": "error",
                    "storybook/context-in-play-function": "error",
                    "storybook/default-exports": "error",
                    "storybook/hierarchy-separator": "warn",
                    "storybook/no-redundant-story-name": "warn",
                    "storybook/no-renderer-packages": "error",
                    "storybook/prefer-pascal-case": "error",
                    "storybook/story-exports": "error",
                    "storybook/use-storybook-expect": "error",
                    "storybook/use-storybook-testing-library": "error",
                },
            },
            {
                files: [".storybook/main.@(js|cjs|mjs|ts)"],
                rules: { "storybook/no-uninstalled-addons": "error" },
            },
        ],
    },
};
