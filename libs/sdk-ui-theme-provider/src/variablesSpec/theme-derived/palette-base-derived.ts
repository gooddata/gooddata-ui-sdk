// (C) 2024-2025 GoodData Corporation
import { type ThemeDerivedCssVariable } from "../types.js";

export const derivedPaletteBaseThemeVariables: ThemeDerivedCssVariable[] = [
    {
        type: "derived",
        variableName: "--gd-palette-error-base-d10",
        defaultValue: "#d62a1e",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-d20",
        defaultValue: "#aa2117",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-t02",
        defaultValue: "rgba(229, 77, 66, 0.98)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-t10",
        defaultValue: "rgba(229, 77, 66, 0.9)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-t50",
        defaultValue: "rgba(229, 77, 66, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-t70d20",
        defaultValue: "rgba(170, 33, 23, 0.3)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-base-t85",
        defaultValue: "rgba(229, 77, 66, 0.15)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-dimmed",
        defaultValue: "#fcedec",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-dimmed90",
        defaultValue: "#e75e54",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-disabled",
        defaultValue: "rgba(241, 161, 156, 0.6)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-focus",
        defaultValue: "rgba(235, 119, 111, 0.6)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-error-lightest",
        // Most used:
        defaultValue: "#fff2f1",
        // Default generated (does not fit with most used):
        // defaultValue: "#fdeeed",
    },
    {
        type: "derived",
        variableName: "--gd-palette-info-base-t02",
        defaultValue: "var(--gd-palette-primary-base-t02, rgba(20, 178, 226, 0.98))",
    },
    {
        type: "derived",
        variableName: "--gd-palette-info-base-t85",
        defaultValue: "var(--gd-palette-primary-base-t85, rgba(20, 178, 226, 0.15))",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-d06",
        defaultValue: "#129cc6",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-d12",
        defaultValue: "#0f86aa",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-darken20",
        defaultValue: "#0c6884",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-dimmed-darken03",
        // Most used:
        defaultValue: "#daf2fa",
        // Default generated (does not fit with most used):
        // defaultValue: "#d9f2fa",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-lighten45",
        defaultValue: "#dff5fc",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-mix15-white",
        // Most used:
        defaultValue: "rgba(220, 243, 251, 0.925)",
        // Default generated (does not fit with most used - is calculated differently in theme and scss):
        // defaultValue: "rgba(137, 216, 240, 0.925)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t02",
        defaultValue: "rgba(20, 178, 226, 0.98)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t10",
        defaultValue: "rgba(20, 178, 226, 0.9)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t25",
        defaultValue: "rgba(20, 178, 226, 0.75)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t50",
        defaultValue: "rgba(20, 178, 226, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t70",
        defaultValue: "rgba(20, 178, 226, 0.3)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t80",
        defaultValue: "rgba(20, 178, 226, 0.2)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t85",
        defaultValue: "rgba(20, 178, 226, 0.15)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-base-t90",
        defaultValue: "rgba(20, 178, 226, 0.1)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-dimmed",
        // Most used:
        defaultValue: "#e8f7fc",
        // Default generated (does not fit with most used):
        // defaultValue: "#e7f7fc",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-dimmed50",
        // Most used:
        defaultValue: "#8ad9f1",
        // Default generated (does not fit with most used):
        // defaultValue: "#89d8f0",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-disabled",
        defaultValue: "rgba(69, 199, 239, 0.6)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-focus",
        defaultValue: "rgba(41, 190, 236, 0.6)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-primary-lightest",
        // Most used:
        defaultValue: "#dff5fc",
        // Default generated (does not fit with most used - is calculated differently in theme and scss):
        // defaultValue: "#ecf9fd",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-base-d06",
        defaultValue: "#00a277",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-base-d12",
        defaultValue: "#008460",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-base-t02",
        defaultValue: "rgba(0, 193, 141, 0.98)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-base-t85",
        defaultValue: "rgba(0, 193, 141, 0.15)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-dimmed",
        defaultValue: "#e5f8f3",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-disabled",
        defaultValue: "rgba(0, 224, 163, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-success-focus",
        defaultValue: "rgba(0, 224, 163, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-base-t50",
        defaultValue: "rgba(241, 134, 0, 0.5)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-base-t70d20",
        defaultValue: "rgba(179, 153, 4, 0.3)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-base-t85",
        defaultValue: "rgba(241, 134, 0, 0.15)",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-dimmed",
        defaultValue: "#fce7cc",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-dimmed40",
        defaultValue: "#8a6434",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-text-dimmed",
        defaultValue: "#685945",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-low-base-m80",
        defaultValue: "#d0f0f9",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-medium-base-m80",
        defaultValue: "#fce7cc",
    },
    {
        type: "derived",
        variableName: "--gd-palette-warning-high-base-m80",
        defaultValue: "#fadbd9",
    },
];
