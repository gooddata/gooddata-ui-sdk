// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"storybook"> = {
    packages: [
        {
            name: "eslint-plugin-storybook",
            version: "^9.0.17",
        },
        {
            // peer
            name: "storybook",
            version: "^9.0.17",
        },
        {
            // peer
            name: "@testing-library/dom",
            version: "10.4.0",
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

export default configuration;
