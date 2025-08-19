// (C) 2025 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const toastMessageThemeVariables = [
    // progress
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-textColor",
        themePath: ["toastMessage", "information", "textColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-backgroundColor",
        themePath: ["toastMessage", "information", "backgroundColor"],
        defaultValue:
            "var(--gd-palette-info-base-t02, var(--gd-palette-primary-base-t02, rgba(20, 178, 226, 0.98)))",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-borderColor",
        themePath: ["toastMessage", "information", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-borderWidth",
        themePath: ["toastMessage", "information", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-borderRadius",
        themePath: ["toastMessage", "information", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-dropShadow",
        themePath: ["toastMessage", "information", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-closeButtonColor",
        themePath: ["toastMessage", "information", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-linkButtonColor",
        themePath: ["toastMessage", "information", "linkButtonColor"],
        defaultValue: "rgba(255, 255, 255, 0.85)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-information-separatorLineColor",
        themePath: ["toastMessage", "information", "separatorLineColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },

    // success
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-textColor",
        themePath: ["toastMessage", "success", "textColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-backgroundColor",
        themePath: ["toastMessage", "success", "backgroundColor"],
        defaultValue: "var(--gd-palette-success-base-t02, rgba(0, 193, 141, 0.98))",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-borderColor",
        themePath: ["toastMessage", "success", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-borderWidth",
        themePath: ["toastMessage", "success", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-borderRadius",
        themePath: ["toastMessage", "success", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-dropShadow",
        themePath: ["toastMessage", "success", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-closeButtonColor",
        themePath: ["toastMessage", "success", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-linkButtonColor",
        themePath: ["toastMessage", "success", "linkButtonColor"],
        defaultValue: "rgba(255, 255, 255, 0.85)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-success-separatorLineColor",
        themePath: ["toastMessage", "success", "separatorLineColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },

    // warning
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-textColor",
        themePath: ["toastMessage", "warning", "textColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-backgroundColor",
        themePath: ["toastMessage", "warning", "backgroundColor"],
        defaultValue: "var(--gd-palette-warning-base, #f18600)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-borderColor",
        themePath: ["toastMessage", "warning", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-borderWidth",
        themePath: ["toastMessage", "warning", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-borderRadius",
        themePath: ["toastMessage", "warning", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-dropShadow",
        themePath: ["toastMessage", "warning", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-closeButtonColor",
        themePath: ["toastMessage", "warning", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-linkButtonColor",
        themePath: ["toastMessage", "warning", "linkButtonColor"],
        defaultValue: "rgba(255, 255, 255, 0.85)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-warning-separatorLineColor",
        themePath: ["toastMessage", "warning", "separatorLineColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },

    // error
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-textColor",
        themePath: ["toastMessage", "error", "textColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-backgroundColor",
        themePath: ["toastMessage", "error", "backgroundColor"],
        defaultValue: "var(--gd-palette-error-base-t02, rgba(229, 77, 66, 0.98))",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-borderColor",
        themePath: ["toastMessage", "error", "borderColor"],
        defaultValue: "transparent",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-borderWidth",
        themePath: ["toastMessage", "error", "borderWidth"],
        defaultValue: "0",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-borderRadius",
        themePath: ["toastMessage", "error", "borderRadius"],
        defaultValue: "3px",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-dropShadow",
        themePath: ["toastMessage", "error", "dropShadow"],
        defaultValue: null,
        defaultThemeValue: true,
        skipDefaultValueValidation: true,
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-closeButtonColor",
        themePath: ["toastMessage", "error", "closeButtonColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-linkButtonColor",
        themePath: ["toastMessage", "error", "linkButtonColor"],
        defaultValue: "rgba(255, 255, 255, 0.85)",
    },
    {
        type: "theme",
        variableName: "--gd-toastMessage-error-separatorLineColor",
        themePath: ["toastMessage", "error", "separatorLineColor"],
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
] satisfies ThemeDefinedCssVariable[];
