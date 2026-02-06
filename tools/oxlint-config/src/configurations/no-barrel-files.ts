// (C) 2026 GoodData Corporation

import { noBarrelFilesOverrides, noBarrelFilesPlugin, noBarrelFilesRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const noBarrelFiles: IConfiguration<"no-barrel-files"> = {
    packages: [noBarrelFilesPlugin],
    jsPlugins: [{ name: "no-barrel-files", specifier: noBarrelFilesPlugin.name }],
    rules: noBarrelFilesRules,
    overrides: noBarrelFilesOverrides,
};
