// (C) 2026 GoodData Corporation

import { IOverride, IPackage, Rules } from "../types.js";

export const noBarrelFilesPlugin: IPackage = {
    name: "eslint-plugin-no-barrel-files",
    version: "1.2.2",
};

export const noBarrelFilesRules: Rules<"no-barrel-files"> = {
    "no-barrel-files/no-barrel-files": "error",
};

export const noBarrelFilesOverrides: IOverride<"no-barrel-files">[] = [
    {
        files: ["**/eslint.config.ts"],
        rules: {
            "no-barrel-files/no-barrel-files": "off",
        },
    },
];
