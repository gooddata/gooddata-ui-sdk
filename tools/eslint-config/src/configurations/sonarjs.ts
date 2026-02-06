// (C) 2025-2026 GoodData Corporation

import { sonarjsOverrides, sonarjsPlugin, sonarjsRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const commonConfiguration = {
    packages: [sonarjsPlugin],
    rules: sonarjsRules,
    overrides: sonarjsOverrides,
};

const v9 = {
    ...commonConfiguration,
    plugins: { sonarjs: sonarjsPlugin },
};

export const sonarjs: IDualConfiguration<"sonarjs"> = {
    v8: {
        ...commonConfiguration,
        plugins: ["sonarjs"],
    },
    v9,
    ox: {},
};
