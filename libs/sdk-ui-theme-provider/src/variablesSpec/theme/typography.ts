// (C) 2024 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const typographyThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["typography", "font"],
        variableName: "--gd-typography-font",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["typography", "fontBold"],
        variableName: "--gd-typography-fontBold",
        defaultValue: null,
    },
];
