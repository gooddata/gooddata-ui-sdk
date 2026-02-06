// (C) 2026 GoodData Corporation

import { noOnlyTestsPlugin, noOnlyTestsRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const noOnlyTests: IConfiguration<"no-only-tests"> = {
    packages: [noOnlyTestsPlugin],
    jsPlugins: [{ name: "no-only-tests", specifier: noOnlyTestsPlugin.name }],
    rules: noOnlyTestsRules,
};
