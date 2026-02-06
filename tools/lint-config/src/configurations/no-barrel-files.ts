// (C) 2026 GoodData Corporation

import { IPackage } from "../types.js";

export const noBarrelFilesPlugin: IPackage = {
    name: "eslint-plugin-no-barrel-files",
    version: "1.2.2",
};

export const noBarrelFilesRules = {
    "no-barrel-files/no-barrel-files": "error",
};

export const noBarrelFilesOverrides = [
    {
        files: ["**/eslint.config.ts"],
        rules: {
            "no-barrel-files/no-barrel-files": "off",
        },
    },
];
