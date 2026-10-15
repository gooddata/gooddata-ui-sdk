// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm";

export default [
    ...config,
    {
        // Version 2 names documents, pages and widgets; report and slot belong to version 1 and the wire.
        files: ["src/publisher/v2/**"],
        // Tests check that version 1 shapes are rejected, so they name them.
        ignores: ["**/*.test.ts"],
        rules: {
            "id-match": ["error", "^(?!.*(?:[Rr]eport|REPORT|[Ss]lot|SLOT)).*$", { properties: true }],
            "no-restricted-syntax": [
                "error",
                {
                    selector: "Literal[value=/report|slot/i]",
                    message: "Version 2 Publisher code names documents, pages and widgets.",
                },
                {
                    selector: "TemplateElement[value.raw=/report|slot/i]",
                    message: "Version 2 Publisher code names documents, pages and widgets.",
                },
            ],
        },
    },
];
