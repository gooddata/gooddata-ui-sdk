// (C) 2025-2026 GoodData Corporation

import { noOnlyTestsPlugin, noOnlyTestsRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [noOnlyTestsPlugin],
    plugins: { "no-only-tests": noOnlyTestsPlugin },
    rules: noOnlyTestsRules,
};

export const noOnlyTests: IDualConfiguration<"no-only-tests"> = {
    v8: {
        packages: [
            {
                name: "eslint-plugin-no-only-tests",
                version: "2.6.0",
            },
        ],
        plugins: ["no-only-tests"],
        rules: noOnlyTestsRules,
    },
    v9,
    ox: {},
};
