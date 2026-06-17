// (C) 2025-2026 GoodData Corporation

import { type ThemeInternalCssVariable } from "../types.js";

export const internalGeoThemeVariables: ThemeInternalCssVariable[] = [
    {
        type: "internal",
        variableName: "--gd-geo-multi-layer-legend__section-header-height",
        defaultValue: "34px",
    },
    {
        type: "internal",
        variableName: "--gd-geo-multi-layer-legend__toggle-duration",
        defaultValue: "0.2s",
    },
    // Tooltip background, shared between the card and its clipped-content fade; referenced without a
    // fallback, so no default value to validate.
    {
        type: "internal",
        variableName: "--gd-viz-tooltip-bg",
        defaultValue: null,
    },
    // Dynamic height cap fed from JS; unset (none) means no clamp.
    {
        type: "internal",
        variableName: "--gd-viz-tooltip-max-height",
        defaultValue: "none",
    },
];
