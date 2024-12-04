// (C) 2024 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const kpiThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["kpi", "primaryMeasureColor"],
        variableName: "--gd-kpi-primaryMeasureColor",
        defaultValue: "var(--gd-palette-complementary-9, #000)",
    },
    {
        type: "theme",
        themePath: ["kpi", "secondaryInfoColor"],
        variableName: "--gd-kpi-secondaryInfoColor",
        defaultValue: "var(--gd-palette-complementary-3-from-theme, rgba(176, 190, 202, 0.5))",
    },
    {
        type: "theme",
        themePath: ["kpi", "value", "negativeColor"],
        variableName: "--gd-kpi-value-negativeColor",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["kpi", "value", "positiveColor"],
        variableName: "--gd-kpi-value-positiveColor",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["kpi", "value", "textAlign"],
        variableName: "--gd-kpi-value-textAlign",
        defaultValue: null,
    },
];
