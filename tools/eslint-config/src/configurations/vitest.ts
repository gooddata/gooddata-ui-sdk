// (C) 2025-2026 GoodData Corporation

import { type IPackage, scopeRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const vitestPlugin: IPackage = {
    name: "@vitest/eslint-plugin",
    version: "1.6.6",
};

const commonRules = {
    "no-conditional-expect": "error",
    "no-import-node-test": "error",
    "no-interpolation-in-snapshots": "error",
    "no-mocks-import": "error",
    "no-standalone-expect": "error",
    "no-unneeded-async-expect-function": "error",
    "prefer-called-exactly-once-with": "error",
    "require-local-test-context-for-concurrent-snapshots": "error",
    "valid-describe-callback": "error",
    "valid-expect-in-promise": "error",

    "expect-expect": "off",
    "no-commented-out-tests": "warn",
    "valid-title": "error",
    "no-disabled-tests": "warn",
    "no-focused-tests": "warn",
    "no-identical-title": "warn",
    "valid-expect": "warn",
};

const packages = [vitestPlugin];

const v9 = {
    packages,
    plugins: { vitest: vitestPlugin },
    rules: scopeRules(commonRules, "vitest"),
};

export const vitest: IDualConfiguration<"@vitest", "vitest"> = {
    v8: {
        packages,
        plugins: ["@vitest"],
        rules: scopeRules(commonRules, "@vitest"),
    },
    v9,
    ox: v9,
};
