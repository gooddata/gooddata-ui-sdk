// (C) 2024 GoodData Corporation
import { type ThemeDefinedCssVariable } from "../types.js";

export const tooltipThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        variableName: "--gd-tooltip-backgroundColor",
        themePath: ["tooltip", "backgroundColor"],
        defaultValue: "var(--gd-palette-complementary-8-from-theme, rgba(70, 78, 86, 0.95))",
    },
    {
        type: "theme",
        variableName: "--gd-tooltip-color",
        themePath: ["tooltip", "color"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
];
