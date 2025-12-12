// (C) 2024-2025 GoodData Corporation
import { type ThemeInternalCssVariable } from "../types.js";

export const internalIconThemeVariables: ThemeInternalCssVariable[] = [
    {
        type: "internal",
        variableName: "--gd-icon-fill-color",
        defaultValue: "var(--gd-palette-complementary-9)",
    },
    {
        type: "internal",
        variableName: "--gd-icon-background-color",
        defaultValue: "var(--gd-palette-complementary-2)",
    },
];
