// (C) 2025-2026 GoodData Corporation

import { sonarjsOverrides, sonarjsPlugin, sonarjsRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const commonConfiguration = {
    packages: [sonarjsPlugin],
    rules: sonarjsRules,
    overrides: sonarjsOverrides,
};

const flat = {
    ...commonConfiguration,
    plugins: { sonarjs: sonarjsPlugin },
};

export const sonarjs: IConfiguration<"sonarjs"> = {
    legacy: {
        ...commonConfiguration,
        plugins: ["sonarjs"],
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
