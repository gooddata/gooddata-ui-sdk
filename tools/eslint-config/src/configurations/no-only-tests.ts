// (C) 2025-2026 GoodData Corporation

import { noOnlyTestsPlugin, noOnlyTestsRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const flat = {
    packages: [noOnlyTestsPlugin],
    plugins: { "no-only-tests": noOnlyTestsPlugin },
    rules: noOnlyTestsRules,
};

export const noOnlyTests: IConfiguration<"no-only-tests"> = {
    legacy: {
        packages: [
            {
                name: "eslint-plugin-no-only-tests",
                version: "2.6.0",
            },
        ],
        plugins: ["no-only-tests"],
        rules: noOnlyTestsRules,
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
