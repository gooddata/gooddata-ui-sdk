// (C) 2026 GoodData Corporation

import { type ThemeInternalCssVariable } from "../types.js";

export const internalToolbarThemeVariables: ThemeInternalCssVariable[] = [
    {
        // Controls inside the toolbar are squarer than the container and than buttons.
        type: "internal",
        variableName: "--gd-toolbar-control-borderRadius",
        defaultValue: "2px",
    },
];
