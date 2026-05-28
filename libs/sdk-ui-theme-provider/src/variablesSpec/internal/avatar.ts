// (C) 2026 GoodData Corporation

import { type ThemeInternalCssVariable } from "../types.js";

export const internalAvatarThemeVariables: ThemeInternalCssVariable[] = [
    {
        type: "internal",
        variableName: "--gd-avatar-background-color",
        defaultValue: "var(--gd-palette-complementary-2)",
    },
    {
        type: "internal",
        variableName: "--gd-avatar-size",
        defaultValue: null,
    },
];
