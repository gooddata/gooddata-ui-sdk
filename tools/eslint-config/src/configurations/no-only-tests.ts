// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"no-only-tests"> = {
    packages: [
        {
            name: "eslint-plugin-no-only-tests",
            version: "2.6.0",
        },
    ],
    plugin: "no-only-tests",
    rules: {
        "no-only-tests/no-only-tests": ["error", { block: ["fixture"], focus: ["only"] }],
    },
};

export default configuration;
