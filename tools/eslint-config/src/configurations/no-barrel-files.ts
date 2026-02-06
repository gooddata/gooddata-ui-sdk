// (C) 2026 GoodData Corporation

import { noBarrelFilesOverrides, noBarrelFilesPlugin, noBarrelFilesRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const commonConfiguration = {
    packages: [noBarrelFilesPlugin],
    rules: noBarrelFilesRules,
    overrides: noBarrelFilesOverrides,
};

const v9 = { ...commonConfiguration, plugins: { "no-barrel-files": noBarrelFilesPlugin } };

export const noBarrelFiles: IDualConfiguration<"no-barrel-files"> = {
    v8: { ...commonConfiguration, plugins: ["no-barrel-files"] },
    v9,
    ox: {},
};
