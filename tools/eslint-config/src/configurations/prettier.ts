// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const prettier: IConfiguration<"prettier"> = {
    packages: [
        {
            name: "prettier",
            version: "^3.6.2",
        },
        {
            name: "eslint-config-prettier",
            version: "10.1.8",
        },
        {
            name: "eslint-plugin-prettier",
            version: "5.5.4",
        },
    ],
    extends: ["plugin:prettier/recommended"],
};
