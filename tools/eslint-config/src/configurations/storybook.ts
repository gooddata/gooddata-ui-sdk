// (C) 2025-2026 GoodData Corporation

import { storybookOverrides, storybookPackages, storybookPlugin } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const commonConfiguration = {
    packages: storybookPackages,
    overrides: storybookOverrides,
};

const flat = {
    ...commonConfiguration,
    plugins: { storybook: storybookPlugin },
};

export const storybook: IConfiguration<"storybook", ""> = {
    legacy: {
        ...commonConfiguration,
        plugins: ["storybook"],
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
