// (C) 2024-2025 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const chartThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["chart", "axis", "color"],
        variableName: "--gd-chart-axis-color",
        defaultValue: "var(--gd-palette-complementary-4-from-theme, #ccd6eb)",
    },
    {
        type: "theme",
        themePath: ["chart", "axis", "labelColor"],
        variableName: "--gd-chart-axis-labelColor",
        defaultValue: "var(--gd-palette-complementary-7, #6d7680)",
    },
    {
        type: "theme",
        themePath: ["chart", "axis", "valueColor"],
        variableName: "--gd-chart-axis-valueColor",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["chart", "backgroundColor"],
        variableName: "--gd-chart-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["chart", "gridColor"],
        variableName: "--gd-chart-gridColor",
        defaultValue: "var(--gd-palette-complementary-3-from-theme, #ebebeb)",
    },
    {
        type: "theme",
        themePath: ["chart", "legendValueColor"],
        variableName: "--gd-chart-legendValueColor",
        defaultValue: "var(--gd-palette-complementary-7, #6d7680)",
    },

    {
        type: "theme",
        themePath: ["chart", "tooltip", "backgroundColor"],
        variableName: "--gd-chart-tooltip-backgroundColor",
        defaultValue:
            "var(--gd-chart-tooltipBackgroundColor, var(--gd-palette-complementary-0-from-theme, rgba(255, 255, 255, 0.95)))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltip", "borderColor"],
        variableName: "--gd-chart-tooltip-borderColor",
        defaultValue:
            "var(--gd-chart-tooltipBorderColor, var(--gd-palette-complementary-3-from-theme, rgba(201, 213, 224, 0.7)))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltip", "labelColor"],
        variableName: "--gd-chart-tooltip-labelColor",
        defaultValue:
            "var(--gd-chart-tooltipLabelColor, var(--gd-palette-complementary-6-from-theme, var(--gd-palette-complementary-9, #000)))",
    },
    {
        type: "theme",
        themePath: ["chart", "tooltip", "valueColor"],
        variableName: "--gd-chart-tooltip-valueColor",
        defaultValue: "var(--gd-chart-tooltipValueColor, var(--gd-palette-complementary-9, #000))",
    },
    {
        type: "theme",
        themePath: ["chart", "legendLabelColor"],
        variableName: "--gd-chart-legendLabelColor",
        defaultValue: "var(--gd-palette-complementary-5, #b0beca)",
        isNotTypedByTheme: true,
    },
    //data label
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "backplateTextColor"],
        variableName: "--gd-chart-dataLabel-backplateTextColor",
        defaultValue: "var(--gd-palette-complementary-9, #000)",
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "backplateBackgroundColor"],
        variableName: "--gd-chart-dataLabel-backplateBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "backplateBorderColor"],
        variableName: "--gd-chart-dataLabel-backplateBorderColor",
        defaultValue: "var(--gd-palette-complementary-3-from-theme, #dde4eb)",
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "backplateDropShadow"],
        variableName: "--gd-chart-dataLabel-backplateDropShadow",
        defaultValue: null,
        defaultThemeValue: false,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "backplateBorderRadius"],
        variableName: "--gd-chart-dataLabel-backplateBorderRadius",
        defaultValue: "2px",
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "autoDarkTextColor"],
        variableName: "--gd-chart-dataLabel-autoDarkTextColor",
        defaultValue: null,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "autoLightTextColor"],
        variableName: "--gd-chart-dataLabel-autoLightTextColor",
        defaultValue: null,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        themePath: ["chart", "dataLabel", "autoLightTextShadow"],
        variableName: "--gd-chart-dataLabel-autoLightTextShadow",
        defaultValue: null,
        defaultThemeValue: true,
    },
];
