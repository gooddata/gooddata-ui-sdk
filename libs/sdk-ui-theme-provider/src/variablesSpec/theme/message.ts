// (C) 2025 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const messageThemeVariables = [
    // progress
    {
        type: "theme",
        variableName: "--gd-message-information-textColor",
        themePath: ["message", "information", "textColor"],
        defaultValue: "var(--gd-palette-info-base, var(--gd-palette-primary-base, #14b2e2))",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-backgroundColor",
        themePath: ["message", "information", "backgroundColor"],
        defaultValue:
            "var(--gd-palette-info-base-t85, var(--gd-palette-primary-base-t85, rgba(20, 178, 226, 0.15)))",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-borderColor",
        themePath: ["message", "information", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-borderWidth",
        themePath: ["message", "information", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-borderRadius",
        themePath: ["message", "information", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-dropShadow",
        themePath: ["message", "information", "dropShadow"],
        defaultValue: "none",
        defaultThemeValue: false,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-message-information-closeButtonColor",
        themePath: ["message", "information", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-message-information-linkButtonColor",
        themePath: ["message", "information", "linkButtonColor"],
        defaultValue: "currentColor",
    },

    // success
    {
        type: "theme",
        variableName: "--gd-message-success-textColor",
        themePath: ["message", "success", "textColor"],
        defaultValue: "var(--gd-palette-success-base, #00c18d)",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-backgroundColor",
        themePath: ["message", "success", "backgroundColor"],
        defaultValue: "var(--gd-palette-success-base-t85, rgba(0, 193, 141, 0.15))",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-borderColor",
        themePath: ["message", "success", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-borderWidth",
        themePath: ["message", "success", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-borderRadius",
        themePath: ["message", "success", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-dropShadow",
        themePath: ["message", "success", "dropShadow"],
        defaultValue: "none",
        defaultThemeValue: false,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-message-success-closeButtonColor",
        themePath: ["message", "success", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-message-success-linkButtonColor",
        themePath: ["message", "success", "linkButtonColor"],
        defaultValue: "currentColor",
    },

    // warning
    {
        type: "theme",
        variableName: "--gd-message-warning-textColor",
        themePath: ["message", "warning", "textColor"],
        defaultValue: "var(--gd-palette-warning-base, #f18600)",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-backgroundColor",
        themePath: ["message", "warning", "backgroundColor"],
        defaultValue: "var(--gd-palette-warning-base-t85, rgba(241, 134, 0, 0.15))",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-borderColor",
        themePath: ["message", "warning", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-borderWidth",
        themePath: ["message", "warning", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-borderRadius",
        themePath: ["message", "warning", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-dropShadow",
        themePath: ["message", "warning", "dropShadow"],
        defaultValue: "none",
        defaultThemeValue: false,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-closeButtonColor",
        themePath: ["message", "warning", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-message-warning-linkButtonColor",
        themePath: ["message", "warning", "linkButtonColor"],
        defaultValue: "currentColor",
    },

    // error
    {
        type: "theme",
        variableName: "--gd-message-error-textColor",
        themePath: ["message", "error", "textColor"],
        defaultValue: "var(--gd-palette-error-base, #e54d42)",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-backgroundColor",
        themePath: ["message", "error", "backgroundColor"],
        defaultValue: "var(--gd-palette-error-base-t85, rgba(229, 77, 66, 0.15))",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-borderColor",
        themePath: ["message", "error", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-borderWidth",
        themePath: ["message", "error", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-borderRadius",
        themePath: ["message", "error", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-dropShadow",
        themePath: ["message", "error", "dropShadow"],
        defaultValue: "none",
        defaultThemeValue: false,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-message-error-closeButtonColor",
        themePath: ["message", "error", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-message-error-linkButtonColor",
        themePath: ["message", "error", "linkButtonColor"],
        defaultValue: "currentColor",
    },
] satisfies ThemeDefinedCssVariable[];
