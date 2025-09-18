// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newKpiWidget } from "@gooddata/sdk-backend-base";
import { AnalyticalWidgetType, idRef, newInsightDefinition } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import {
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForGrid,
    getDashboardLayoutWidgetDefaultHeight,
    getDashboardLayoutWidgetMaxGridHeight,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMinGridWidth,
} from "../sizing.js";

export const allVisTypes: VisType[] = [
    "area",
    "bar",
    "bubble",
    "bullet",
    "column",
    "combo",
    "combo2",
    "donut",
    "funnel",
    "headline",
    "heatmap",
    "line",
    "pushpin",
    "pie",
    "scatter",
    "table",
    "treemap",
    "xirr",
];

const measureRef = idRef("measure");
const kpiWidget = newKpiWidget(measureRef, (w) => w.title("Kpi widget"));
const kpiWidgetPop = newKpiWidget(measureRef, (w) =>
    w.title("Kpi Pop widget").comparisonType("previousPeriod").comparisonDirection("growIsBad"),
);

describe("sizing", () => {
    describe("getDashboardLayoutWidgetDefaultHeight", () => {
        const settings = {};
        it.each(allVisTypes)("should get default height for insight widget %s", (visType) => {
            expect(
                getDashboardLayoutWidgetDefaultHeight(
                    settings,
                    "insight",
                    newInsightDefinition(`local:${visType}`),
                ),
            ).toMatchSnapshot();
        });

        it("should get default height for kpi without pop widget", () => {
            expect(getDashboardLayoutWidgetDefaultHeight(settings, "kpi", kpiWidget.kpi)).toMatchSnapshot();
        });

        it("should get default height for kpi with pop widget", () => {
            expect(
                getDashboardLayoutWidgetDefaultHeight(settings, "kpi", kpiWidgetPop.kpi),
            ).toMatchSnapshot();
        });

        it("should get default height for rich text widget", () => {
            expect(getDashboardLayoutWidgetDefaultHeight(settings, "richText")).toMatchSnapshot();
        });

        it("should get default height for unknown widget", () => {
            expect(getDashboardLayoutWidgetDefaultHeight(settings, "unknown" as any)).toMatchSnapshot();
        });

        it("should get default height for visualization switcher widget", () => {
            expect(
                getDashboardLayoutWidgetDefaultHeight(settings, "visualizationSwitcher"),
            ).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutWidgetMinGridHeight", () => {
        const settings = {};
        it.each(allVisTypes)("should get min height for insight widget %s", (visType) => {
            expect(
                getDashboardLayoutWidgetMinGridHeight(
                    settings,
                    "insight",
                    newInsightDefinition(`local:${visType}`),
                ),
            ).toMatchSnapshot();
        });

        it("should get min height for kpi without pop widget", () => {
            expect(getDashboardLayoutWidgetMinGridHeight(settings, "kpi", kpiWidget.kpi)).toMatchSnapshot();
        });

        it("should get min height for kpi with pop widget", () => {
            expect(
                getDashboardLayoutWidgetMinGridHeight(settings, "kpi", kpiWidgetPop.kpi),
            ).toMatchSnapshot();
        });

        it("should get min height for rich text widget", () => {
            expect(getDashboardLayoutWidgetMinGridHeight(settings, "richText")).toMatchSnapshot();
        });

        it("should get min height for unknown widget", () => {
            expect(getDashboardLayoutWidgetMinGridHeight(settings, "unknown" as any)).toMatchSnapshot();
        });

        it("should get min height for visualization switcher widget", () => {
            expect(
                getDashboardLayoutWidgetMinGridHeight(settings, "visualizationSwitcher"),
            ).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutWidgetMaxGridHeight", () => {
        const settings = {};
        it.each(allVisTypes)("should get max height for insight widget %s", (visType) => {
            expect(
                getDashboardLayoutWidgetMaxGridHeight(
                    settings,
                    "insight",
                    newInsightDefinition(`local:${visType}`),
                ),
            ).toMatchSnapshot();
        });

        it("should get max height for kpi widget", () => {
            expect(getDashboardLayoutWidgetMaxGridHeight(settings, "kpi")).toMatchSnapshot();
        });

        it("should get max height for rich text widget", () => {
            expect(getDashboardLayoutWidgetMaxGridHeight(settings, "richText")).toMatchSnapshot();
        });

        it("should get max height for unknown widget", () => {
            expect(getDashboardLayoutWidgetMaxGridHeight(settings, "unknown" as any)).toMatchSnapshot();
        });

        it("should get max height for visualization switcher widget", () => {
            expect(
                getDashboardLayoutWidgetMaxGridHeight(settings, "visualizationSwitcher"),
            ).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutWidgetMinGridWidth", () => {
        const settings = {};
        it("should get minimum width for unknown visType", () => {
            expect(getDashboardLayoutWidgetMinGridWidth(settings, "insight")).toBe(2);
        });

        it("should get minimum width for kpi", () => {
            expect(getDashboardLayoutWidgetMinGridWidth(settings, "kpi")).toBe(2);
        });

        it("should get minimum width for rich text widget", () => {
            expect(getDashboardLayoutWidgetMinGridWidth(settings, "richText")).toBe(1);
        });

        it("should get minimum width for visualization switcher widget", () => {
            expect(getDashboardLayoutWidgetMinGridWidth(settings, "visualizationSwitcher")).toBe(2);
        });

        type Scenario = [string, string, VisType | undefined, number];
        const scenarios: Scenario[] = [
            ["KPI", "kpi", undefined, 2],
            ["Headline", "insight", "headline", 2],
            ["Column Chart", "insight", "column", 2],
            ["Bar Chart", "insight", "bar", 2],
            ["Line Chart", "insight", "line", 2],
            ["Area Chart", "insight", "area", 2],
            ["Combo Chart", "insight", "combo", 2],
            ["Combo2 Chart", "insight", "combo2", 2],
            ["Scatter Plot", "insight", "scatter", 2],
            ["Bubble Chart", "insight", "bubble", 2],
            ["Pie Chart", "insight", "pie", 2],
            ["Donut Chart", "insight", "donut", 2],
            ["Treemap", "insight", "treemap", 2],
            ["Heatmap", "insight", "heatmap", 2],
            ["Table", "insight", "table", 2],
            ["Geochart", "insight", "pushpin", 6],
        ];
        it.each(scenarios)(
            "should get min width for %s found in widgets by qualifier",
            (_name, widgetType, visType, width) => {
                expect(
                    getDashboardLayoutWidgetMinGridWidth(
                        settings,
                        widgetType as AnalyticalWidgetType,
                        newInsightDefinition(`local:${visType}`),
                    ),
                ).toBe(width);
            },
        );
    });

    describe("getDashboardLayoutItemHeight", () => {
        it("should calculate widget height when custom heigh is specified", () => {
            expect(getDashboardLayoutItemHeight({ gridWidth: 1, gridHeight: 30 })).toBe(600);
        });

        it("should return undefined for widget height when custom height is not specified", () => {
            expect(getDashboardLayoutItemHeight({ gridWidth: 1 })).toBe(undefined);
        });

        it("should return undefined for widget height when heightAsRatio is specified", () => {
            expect(getDashboardLayoutItemHeight({ gridWidth: 1, heightAsRatio: 120 })).toBe(undefined);
        });
    });

    describe("getDashboardLayoutGridItemHeight", () => {
        it("should calculate widget height for selected gridHeight", () => {
            const gridHeight = 11;
            expect(getDashboardLayoutItemHeightForGrid(gridHeight)).toMatchSnapshot();
        });
    });
});
