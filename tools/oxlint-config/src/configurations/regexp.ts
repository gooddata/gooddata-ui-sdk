// (C) 2025-2026 GoodData Corporation

import { regexpPlugin, regexpRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const regexp: IConfiguration = {
    packages: [regexpPlugin],
    jsPlugins: [{ name: "regexp", specifier: regexpPlugin.name }],
    rules: regexpRules,
};
