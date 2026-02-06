// (C) 2025-2026 GoodData Corporation

import { sonarjsOverrides, sonarjsPlugin, sonarjsRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const sonarjs: IConfiguration<"sonarjs"> = {
    packages: [sonarjsPlugin],
    jsPlugins: [{ name: "sonarjs", specifier: sonarjsPlugin.name }],
    rules: sonarjsRules,
    overrides: sonarjsOverrides,
};
