// (C) 2024-2025 GoodData Corporation

import { type ThemeDefinedCssVariable } from "../types.js";

export const tableThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["table", "backgroundColor"],
        variableName: "--gd-table-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["table", "gridColor"],
        variableName: "--gd-table-gridColor",
        defaultValue: "var(--gd-palette-complementary-4-from-theme, rgba(176, 190, 202, 0.5))",
    },
    {
        type: "theme",
        themePath: ["table", "headerHoverBackgroundColor"],
        variableName: "--gd-table-headerHoverBackgroundColor",
        defaultValue:
            "var(--gd-palette-complementary-1-from-theme, var(--gd-palette-primary-dimmed, #e8f7fc))",
    },
    {
        type: "theme",
        themePath: ["table", "headerLabelColor"],
        variableName: "--gd-table-headerLabelColor",
        defaultValue:
            "var(--gd-palette-complementary-7-from-theme, var(--gd-palette-complementary-8, #464e56))",
    },
    {
        type: "theme",
        themePath: ["table", "hoverBackgroundColor"],
        variableName: "--gd-table-hoverBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-1-from-theme, rgba(109, 118, 128, 0.1))",
    },
    {
        type: "theme",
        themePath: ["table", "loadingIconColor"],
        variableName: "--gd-table-loadingIconColor",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["table", "nullValueColor"],
        variableName: "--gd-table-nullValueColor",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["table", "subtotalBackgroundColor"],
        variableName: "--gd-table-subtotalBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-1-from-theme, rgba(176, 190, 202, 0.1))",
    },
    {
        type: "theme",
        themePath: ["table", "totalBackgroundColor"],
        variableName: "--gd-table-totalBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-2-from-theme, rgba(176, 190, 202, 0.2))",
    },
    {
        type: "theme",
        themePath: ["table", "overallTotalBackgroundColor"],
        variableName: "--gd-table-overallTotalBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-5-t60, rgba(176, 190, 202, 0.4))",
    },
    {
        type: "theme",
        themePath: ["table", "totalValueColor"],
        variableName: "--gd-table-totalValueColor",
        defaultValue: "var(--gd-palette-complementary-9, #000)",
    },
    {
        type: "theme",
        themePath: ["table", "valueColor"],
        variableName: "--gd-table-valueColor",
        defaultValue: "var(--gd-palette-complementary-8, #464e56)",
    },
];
