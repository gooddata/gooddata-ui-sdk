// (C) 2024 GoodData Corporation
import { type ThemeDefinedCssVariable } from "../types.js";

export const analyticalDesignerThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["analyticalDesigner", "title", "color"],
        variableName: "--gd-analyticalDesigner-title-color",
        defaultValue: "var(--gd-palette-complementary-8, #464e56)",
    },
];
