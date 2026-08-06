// (C) 2025-2026 GoodData Corporation

import { storybookOverrides, storybookPackages, storybookPlugin } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

export const storybook: IDualConfiguration<"storybook", ""> = {
    v8: {
        packages: storybookPackages,
        overrides: storybookOverrides,
        plugins: ["storybook"],
    },
    v9: {
        packages: storybookPackages,
        overrides: storybookOverrides,
        plugins: { storybook: storybookPlugin },
    },
    ox: {},
};
