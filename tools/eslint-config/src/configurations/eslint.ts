// (C) 2025-2026 GoodData Corporation

import { type IPackage, eslintOverrides, eslintRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const common = {
    rules: eslintRules,
    overrides: eslintOverrides,
};

const jitiPackage: IPackage = {
    name: "jiti",
    version: "2.6.1",
};

const v9 = {
    packages: [
        {
            name: "@eslint/js",
            version: "9.39.5",
        },
        jitiPackage,
    ],
    ...common,
};

const v10 = {
    packages: [
        {
            name: "@eslint/js",
            version: "10.0.1",
        },
        jitiPackage,
    ],
    ...common,
};

const ox = {
    packages: [jitiPackage],
};

export const eslint: IConfiguration = {
    legacy: common,
    flat: { v9, v9ox: ox, v10, v10ox: ox },
};
