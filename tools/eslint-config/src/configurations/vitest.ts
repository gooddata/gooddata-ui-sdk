// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const vitest: IConfiguration<"@vitest"> = {
    packages: [
        {
            name: "@vitest/eslint-plugin",
            version: "1.3.5",
        },
    ],
    plugin: "@vitest",
    extends: ["plugin:@vitest/legacy-recommended"],
    rules: {
        "@vitest/expect-expect": "off",
        "@vitest/no-commented-out-tests": "warn",
        "@vitest/valid-title": "error",
        "@vitest/no-disabled-tests": "warn",
        "@vitest/no-focused-tests": "warn",
        "@vitest/no-identical-title": "warn",
        "@vitest/valid-expect": "warn",
    },
};
