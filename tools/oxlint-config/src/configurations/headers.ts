// (C) 2025-2026 GoodData Corporation

import { headersPlugin, headersRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const headers: IConfiguration<"headers"> = {
    packages: [headersPlugin],
    jsPlugins: [{ name: "headers", specifier: headersPlugin.name }],
    rules: headersRules,
};
