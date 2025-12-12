// (C) 2024 GoodData Corporation
import { type ThemeDefinedCssVariable } from "../types.js";

export const buttonThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        variableName: "--gd-button-borderRadius",
        themePath: ["button", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-button-dropShadow",
        themePath: ["button", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-button-textCapitalization",
        themePath: ["button", "textCapitalization"],
        defaultValue: "none",
        defaultThemeValue: false,
    },
];
