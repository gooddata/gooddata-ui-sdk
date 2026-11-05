// (C) 2026 GoodData Corporation

import { noBarrelFilesOverrides, noBarrelFilesPlugin, noBarrelFilesRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const commonConfiguration = {
    packages: [noBarrelFilesPlugin],
    rules: noBarrelFilesRules,
    overrides: noBarrelFilesOverrides,
};

const flat = { ...commonConfiguration, plugins: { "no-barrel-files": noBarrelFilesPlugin } };

export const noBarrelFiles: IConfiguration<"no-barrel-files"> = {
    legacy: { ...commonConfiguration, plugins: ["no-barrel-files"] },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
