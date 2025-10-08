// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"@gooddata"> = {
    packages: [
        {
            name: "@gooddata/eslint-plugin",
            version: "workspace:*",
        },
    ],
    plugin: "@gooddata",
    rules: {
        "@gooddata/prefer-destructure-props-in-signature": "error",
    },
};

export default configuration;
