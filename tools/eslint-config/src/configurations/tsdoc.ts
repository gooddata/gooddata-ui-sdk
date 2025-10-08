// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"tsdoc"> = {
    packages: [
        {
            name: "eslint-plugin-tsdoc",
            version: "0.2.14",
        },
    ],
    plugin: "tsdoc",
    rules: {
        "tsdoc/syntax": "error",
    },
};

export default configuration;
