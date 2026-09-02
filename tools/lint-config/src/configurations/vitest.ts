// (C) 2025-2026 GoodData Corporation

import { IPackage, Rules } from "../types.js";

export const vitestPlugin: IPackage = {
    name: "@vitest/eslint-plugin",
    version: "1.6.19",
};

export const vitestRules: Rules = {
    "no-conditional-expect": "error",
    "no-import-node-test": "error",
    "no-interpolation-in-snapshots": "error",
    "no-mocks-import": "error",
    "no-standalone-expect": "error",
    "no-unneeded-async-expect-function": "error",
    "prefer-called-exactly-once-with": "error",
    "require-local-test-context-for-concurrent-snapshots": "error",
    "valid-describe-callback": "error",
    "expect-expect": "off",
    "no-commented-out-tests": "warn",
    "valid-title": "error",
    "no-disabled-tests": "warn",
    "no-focused-tests": "warn",
    "no-identical-title": "warn",
    "valid-expect": "warn",
    "valid-expect-in-promise": "error",
};
