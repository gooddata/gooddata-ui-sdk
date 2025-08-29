// (C) 2024-2025 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

/**
 * @deprecated
 * switch these colors to deprecated variables once deprecation is announced
 */
export const chartThemeDeprecatedVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["chart", "axisColor"],
        variableName: "--gd-chart-axisColor",
        defaultValue: "var(--gd-palette-complementary-4-from-theme, #ccd6eb)",
    },
    {
        type: "theme",
        themePath: ["chart", "axisLabelColor"],
        variableName: "--gd-chart-axisLabelColor",
        defaultValue: "var(--gd-palette-complementary-7, #6d7680)",
    },
    {
        type: "theme",
        themePath: ["chart", "axisValueColor"],
        variableName: "--gd-chart-axisValueColor",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltipBackgroundColor"],
        variableName: "--gd-chart-tooltipBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-0-from-theme, rgba(255, 255, 255, 0.95))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltipBorderColor"],
        variableName: "--gd-chart-tooltipBorderColor",
        defaultValue: "var(--gd-palette-complementary-3-from-theme, rgba(201, 213, 224, 0.7))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltipLabelColor"],
        variableName: "--gd-chart-tooltipLabelColor",
        defaultValue: "var(--gd-palette-complementary-6-from-theme, var(--gd-palette-complementary-9, #000))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltipValueColor"],
        variableName: "--gd-chart-tooltipValueColor",
        defaultValue: "var(--gd-palette-complementary-9, #000)",
    },
];
