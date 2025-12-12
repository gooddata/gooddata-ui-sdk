// (C) 2024 GoodData Corporation
import { type ThemeDefinedCssVariable } from "../types.js";

export const modalThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        variableName: "--gd-modal-borderColor",
        themePath: ["modal", "borderColor"],
        defaultValue: "var(--gd-palette-complementary-3, #dde4eb)",
    },
    {
        type: "theme",
        variableName: "--gd-modal-borderRadius",
        themePath: ["modal", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-modal-borderWidth",
        themePath: ["modal", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-modal-dropShadow",
        themePath: ["modal", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-modal-outsideBackgroundColor",
        themePath: ["modal", "outsideBackgroundColor"],
        defaultValue: "var(--gd-palette-complementary-2-from-theme, #eff1f3)",
    },
    {
        type: "theme",
        variableName: "--gd-modal-title-color",
        themePath: ["modal", "title", "color"],
        defaultValue: "var(--gd-palette-complementary-9, #000)",
    },
    {
        type: "theme",
        variableName: "--gd-modal-title-lineColor",
        themePath: ["modal", "title", "lineColor"],
        defaultValue: "var(--gd-palette-complementary-3, #dde4eb)",
    },
];
