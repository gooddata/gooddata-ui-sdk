// (C) 2025-2026 GoodData Corporation

import { scopeRules } from "src/utils/scopeRules.js";

import type { IDualConfiguration, IPackage } from "../types.js";

const vitestPlugin: IPackage = {
    name: "@vitest/eslint-plugin",
    version: "1.6.6",
};

const commonRules = {
    "expect-expect": "off",
    "no-commented-out-tests": "warn",
    "valid-title": "error",
    "no-disabled-tests": "warn",
    "no-focused-tests": "warn",
    "no-identical-title": "warn",
    "valid-expect": "warn",
};

export const vitest: IDualConfiguration<"@vitest", "vitest"> = {
    v8: {
        packages: [vitestPlugin],
        plugins: ["@vitest"],
        extends: ["plugin:@vitest/legacy-recommended"],
        rules: scopeRules(commonRules, "@vitest"),
    },
    v9: {
        packages: [vitestPlugin],
        plugins: { vitest: vitestPlugin },
        rules: {
            "vitest/expect-expect": "error",
            "vitest/no-conditional-expect": "error",
            "vitest/no-disabled-tests": "warn",
            "vitest/no-focused-tests": "error",
            "vitest/no-commented-out-tests": "error",
            "vitest/no-identical-title": "error",
            "vitest/no-import-node-test": "error",
            "vitest/no-interpolation-in-snapshots": "error",
            "vitest/no-mocks-import": "error",
            "vitest/no-standalone-expect": "error",
            "vitest/no-unneeded-async-expect-function": "error",
            "vitest/prefer-called-exactly-once-with": "error",
            "vitest/require-local-test-context-for-concurrent-snapshots": "error",
            "vitest/valid-describe-callback": "error",
            "vitest/valid-expect": "error",
            "vitest/valid-expect-in-promise": "error",
            "vitest/valid-title": "error",

            ...scopeRules(commonRules, "vitest"),
        },
    },
};
