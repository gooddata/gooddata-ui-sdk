// (C) 2024 GoodData Corporation
import { ThemeDefinedCssVariable } from "../types.js";

export const dashboardThemeVariables: ThemeDefinedCssVariable[] = [
    {
        type: "theme",
        themePath: ["dashboards", "content", "backgroundColor"],
        variableName: "--gd-dashboards-content-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "backgroundColor"],
        variableName: "--gd-dashboards-content-kpiWidget-backgroundColor",
        defaultValue:
            "var(--gd-dashboards-content-widget-backgroundColor, var(--gd-palette-complementary-0, #fff))",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "borderColor"],
        variableName: "--gd-dashboards-content-kpiWidget-borderColor",
        defaultValue: "var(--gd-dashboards-content-widget-borderColor, transparent)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "borderRadius"],
        variableName: "--gd-dashboards-content-kpiWidget-borderRadius",
        defaultValue: "var(--gd-dashboards-content-widget-borderRadius, 15px)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "borderWidth"],
        variableName: "--gd-dashboards-content-kpiWidget-borderWidth",
        defaultValue: "var(--gd-dashboards-content-widget-borderWidth, 2px)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "dropShadow"],
        variableName: "--gd-dashboards-content-kpiWidget-dropShadow",
        defaultValue: "var(--gd-dashboards-content-widget-dropShadow, none)",
        defaultThemeValue: false,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "kpi", "primaryMeasureColor"],
        variableName: "--gd-dashboards-content-kpiWidget-kpi-primaryMeasureColor",
        defaultValue: "var(--gd-palette-complementary-9-from-theme, #6d7680)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "kpi", "secondaryInfoColor"],
        variableName: "--gd-dashboards-content-kpiWidget-kpi-secondaryInfoColor",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "kpi", "value", "negativeColor"],
        variableName: "--gd-dashboards-content-kpiWidget-kpi-value-negativeColor",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "kpi", "value", "positiveColor"],
        variableName: "--gd-dashboards-content-kpiWidget-kpi-value-positiveColor",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "kpi", "value", "textAlign"],
        variableName: "--gd-dashboards-content-kpiWidget-kpi-value-textAlign",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "title", "color"],
        variableName: "--gd-dashboards-content-kpiWidget-title-color",
        defaultValue:
            "var(--gd-dashboards-content-widget-title-color, var(--gd-palette-complementary-8, #464e56))",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "kpiWidget", "title", "textAlign"],
        variableName: "--gd-dashboards-content-kpiWidget-title-textAlign",
        defaultValue: "var(--gd-dashboards-content-widget-title-textAlign, center)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "backgroundColor"],
        variableName: "--gd-dashboards-content-widget-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "borderColor"],
        variableName: "--gd-dashboards-content-widget-borderColor",
        defaultValue: "transparent",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "borderRadius"],
        variableName: "--gd-dashboards-content-widget-borderRadius",
        defaultValue: "15px",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "borderWidth"],
        variableName: "--gd-dashboards-content-widget-borderWidth",
        defaultValue: "2px",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "chart", "backgroundColor"],
        variableName: "--gd-dashboards-content-widget-chart-backgroundColor",
        // see themeModifier in @gooddata/sdk-ui-dashboard -> --gd-chart-backgroundColor
        defaultValue:
            "var(--gd-dashboards-content-widget-backgroundColor, var(--gd-palette-complementary-0, #fff))",
        isNotTypedByTheme: true,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "dropShadow"],
        variableName: "--gd-dashboards-content-widget-dropShadow",
        defaultValue: "none",
        defaultThemeValue: false,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "table", "backgroundColor"],
        variableName: "--gd-dashboards-content-widget-table-backgroundColor",
        // see themeModifier @gooddata/sdk-ui-dashboard -> --gd-table-backgroundColor
        defaultValue:
            "var(--gd-dashboards-content-widget-backgroundColor, var(--gd-palette-complementary-0, #fff))",
        isNotTypedByTheme: true,
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "title", "color"],
        variableName: "--gd-dashboards-content-widget-title-color",
        defaultValue: "var(--gd-palette-complementary-8, #464e56)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "content", "widget", "title", "textAlign"],
        variableName: "--gd-dashboards-content-widget-title-textAlign",
        defaultValue: "center",
    },
    {
        type: "theme",
        themePath: ["dashboards", "editPanel", "backgroundColor"],
        variableName: "--gd-dashboards-editPanel-backgroundColor",
        defaultValue: null,
    },
    {
        type: "theme",
        themePath: ["dashboards", "filterBar", "backgroundColor"],
        variableName: "--gd-dashboards-filterBar-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "filterBar", "borderColor"],
        variableName: "--gd-dashboards-filterBar-borderColor",
        defaultValue: "var(--gd-palette-complementary-3, #dde4eb)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "filterBar", "filterButton", "backgroundColor"],
        variableName: "--gd-dashboards-filterBar-filterButton-backgroundColor",
        defaultValue: "transparent",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "backgroundColor"],
        variableName: "--gd-dashboards-navigation-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-1-from-theme, #303442)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "borderColor"],
        variableName: "--gd-dashboards-navigation-borderColor",
        defaultValue: "var(--gd-palette-complementary-4-from-theme, rgba(148, 161, 173, 0.2))",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "title", "color"],
        variableName: "--gd-dashboards-navigation-title-color",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "item", "color"],
        variableName: "--gd-dashboards-navigation-item-color",
        defaultValue: "var(--gd-palette-complementary-8-from-theme, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "item", "hoverColor"],
        variableName: "--gd-dashboards-navigation-item-hoverColor",
        defaultValue: "var(--gd-palette-complementary-9-from-theme, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "item", "selectedColor"],
        variableName: "--gd-dashboards-navigation-item-selectedColor",
        defaultValue: "var(--gd-palette-complementary-9-from-theme, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "navigation", "item", "selectedBackgroundColor"],
        variableName: "--gd-dashboards-navigation-item-selectedBackgroundColor",
        defaultValue: "var(--gd-palette-complementary-0-from-theme, #131c28)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "section", "description", "color"],
        variableName: "--gd-dashboards-section-description-color",
        defaultValue: "var(--gd-palette-complementary-6, #94a1ad)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "section", "title", "color"],
        variableName: "--gd-dashboards-section-title-color",
        defaultValue: "var(--gd-palette-complementary-8, #464e56)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "section", "title", "lineColor"],
        variableName: "--gd-dashboards-section-title-lineColor",
        defaultValue: "var(--gd-palette-complementary-3, #dde4eb)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "title", "backgroundColor"],
        variableName: "--gd-dashboards-title-backgroundColor",
        defaultValue: "var(--gd-palette-complementary-0, #fff)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "title", "color"],
        variableName: "--gd-dashboards-title-color",
        defaultValue: "var(--gd-palette-complementary-8, #464e56)",
    },
    {
        type: "theme",
        themePath: ["dashboards", "title", "borderColor"],
        variableName: "--gd-dashboards-title-borderColor",
        defaultValue: "var(--gd-palette-complementary-3, #dde4eb)",
    },
];
