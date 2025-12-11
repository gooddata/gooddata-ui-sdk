// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const reactHooks: IConfiguration<"react-hooks"> = {
    packages: [
        {
            name: "eslint-plugin-react-hooks",
            version: "4.6.0",
        },
    ],
    plugin: "react-hooks",
    extends: ["plugin:react-hooks/recommended"],
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    },
};
