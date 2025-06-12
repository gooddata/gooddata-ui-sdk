// (C) 2024-2025 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const paletteBaseThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        variableName: "--gd-palette-error-base",
        themePath: ["palette", "error", "base"],
        defaultValue: "#e54d42",
    },
    {
        type: "theme",
        variableName: "--gd-palette-info-base",
        themePath: ["palette", "info", "base"],
        defaultValue: "var(--gd-palette-primary-base, #14b2e2)",
    },
    {
        type: "theme",
        variableName: "--gd-palette-primary-base",
        themePath: ["palette", "primary", "base"],
        defaultValue: "#14b2e2",
    },
    {
        type: "theme",
        variableName: "--gd-palette-success-base",
        themePath: ["palette", "success", "base"],
        defaultValue: "#00c18d",
    },
    {
        type: "theme",
        variableName: "--gd-palette-warning-base",
        themePath: ["palette", "warning", "base"],
        defaultValue: "#f18600",
    },
];
