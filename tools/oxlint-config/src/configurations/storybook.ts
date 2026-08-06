// (C) 2026 GoodData Corporation

import { storybookOverrides, storybookPackages, storybookPlugin } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const storybook: IConfiguration<"storybook"> = {
    packages: storybookPackages,
    jsPlugins: [{ name: "storybook", specifier: storybookPlugin.name }],
    overrides: storybookOverrides,
};
