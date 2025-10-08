// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"import"> = {
    packages: [
        {
            name: "eslint-plugin-import",
            version: "2.32.0",
        },
        {
            name: "eslint-import-resolver-typescript",
            version: "4.4.4",
        },
    ],
    plugin: "import",
    extends: ["plugin:import/errors"],
    rules: {
        "import/order": [
            "error",
            {
                pathGroups: [
                    {
                        pattern: "react",
                        group: "external",
                        position: "before",
                    },
                    {
                        pattern: "@gooddata/**",
                        group: "external",
                        position: "after",
                    },
                ],
                groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
                pathGroupsExcludedImportTypes: ["react"],
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
                "newlines-between": "always",
            },
        ],
        "import/no-unassigned-import": "error",
    },
    override: {
        parser: "@typescript-eslint/parser",
        files: ["**/*.ts", "**/*.tsx"],
        extends: ["plugin:import/typescript"],
    },
};

export default configuration;
