// (C) 2026 GoodData Corporation

import { IPackage } from "../types.js";

export const storybookPlugin: IPackage = {
    name: "eslint-plugin-storybook",
    version: "10.5.6",
};

export const storybookPackages = [
    storybookPlugin,
    {
        // peer
        name: "storybook",
        version: "^10.5.6",
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

export const storybookOverrides = [
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
];
