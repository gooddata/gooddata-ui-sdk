// (C) 2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const noBarrelFilesPlugin: IPackage = {
    name: "eslint-plugin-no-barrel-files",
    version: "1.2.2",
};

const commonConfiguration = {
    packages: [noBarrelFilesPlugin],
    plugins: ["no-barrel-files"],
    rules: {
        "no-barrel-files/no-barrel-files": "error",
    },
};

const v9 = { ...commonConfiguration, plugins: { "no-barrel-files": noBarrelFilesPlugin } };

export const barrelFiles: IDualConfiguration<"no-barrel-files"> = {
    v8: { ...commonConfiguration, plugins: ["no-barrel-files"] },
    v9,
    ox: v9,
};
