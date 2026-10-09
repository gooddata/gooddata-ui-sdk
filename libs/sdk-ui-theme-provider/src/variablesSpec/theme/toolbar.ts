// (C) 2026 GoodData Corporation

import { type ThemeDefinedCssVariable } from "../types.js";

export const toolbarThemeVariables: ThemeDefinedCssVariable[] = [
    {
        // The toolbar container. It has its own radius rather than following --gd-button-borderRadius.
        type: "theme",
        variableName: "--gd-toolbar-borderRadius",
        themePath: ["toolbar", "borderRadius"],
        defaultValue: "4px",
    },
];
