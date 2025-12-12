// (C) 2024 GoodData Corporation
import { type ThemeDerivedCssVariable } from "../types.js";

export const derivedShadowThemeVariables: ThemeDerivedCssVariable[] = [
    {
        type: "derived",
        variableName: "--gd-shadow-color",
        // Most used:
        defaultValue: "rgba(20, 56, 93, 0.15)",
        // Default generated (does not fit with most used):
        // defaultValue: "rgba(70, 78, 86, 0.2)",
    },
];
