// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const storybook: IConfiguration<"storybook"> = {
    packages: [
        {
            name: "eslint-plugin-storybook",
            version: "^10.0.6",
        },
        {
            // peer
            name: "storybook",
            version: "^10.0.6",
        },
        {
            // peer
            name: "@testing-library/dom",
            version: "10.4.0",
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
    ],
    plugin: "sonarjs",
    override: {
        files: ["**/*.stories.tsx"],
        extends: ["plugin:storybook/recommended"],
        rules: {
            "storybook/prefer-pascal-case": "error",
        },
    },
};
