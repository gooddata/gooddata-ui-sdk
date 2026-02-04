// (C) 2024-2026 GoodData Corporation

import { type ThemeDerivedCssVariable } from "../types.js";

export const derivedPaletteComplementaryThemeVariables: ThemeDerivedCssVariable[] = [
    {
        type: "derived",
        variableName: "--gd-palette-complementary-0-t10",
        // Most used:
        defaultValue: "rgba(255, 255, 255, 0.95)",
        // Default generated (does not fit with most used - is calculated differently in theme and scss):
        // defaultValue: "rgba(255, 255, 255, 0.9)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-0-t50",
        defaultValue: "rgba(255, 255, 255, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-0-t70",
        defaultValue: "rgba(255, 255, 255, 0.3)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-5-t40",
        defaultValue: "rgba(176, 190, 202, 0.6)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-5-t60",
        defaultValue: "rgba(176, 190, 202, 0.4)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-9-t80",
        defaultValue: "rgba(0, 0, 0, 0.2)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-9-t85",
        defaultValue: "rgba(0, 0, 0, 0.15)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-complementary-9-t90",
        defaultValue: "rgba(0, 0, 0, 0.1)",
    },
];
