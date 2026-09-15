// (C) 2026 GoodData Corporation

import { type ThemeInternalCssVariable } from "../types.js";

export const internalToolbarThemeVariables: ThemeInternalCssVariable[] = [
    {
        // Toolbar items are squarer than buttons, so they do not follow --gd-button-borderRadius.
        type: "internal",
        variableName: "--gd-toolbar-borderRadius",
        defaultValue: "2px",
    },
];
