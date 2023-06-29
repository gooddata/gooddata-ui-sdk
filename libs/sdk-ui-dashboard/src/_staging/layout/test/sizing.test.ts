// (C) 2019-2023 GoodData Corporation
import { newKpiWidget } from "@gooddata/sdk-backend-base";
import {
    getDashboardLayoutWidgetDefaultHeight,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMaxGridHeight,
    getDashboardLayoutWidgetMinGridWidth,
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForGrid,
} from "../sizing.js";
import { VisType } from "@gooddata/sdk-ui";
import { AnalyticalWidgetType, idRef, newInsightDefinition } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

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
        describe.each([false, true])("with customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
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
                expect(
                    getDashboardLayoutWidgetDefaultHeight(settings, "kpi", kpiWidget.kpi),
                ).toMatchSnapshot();
            });

            it("should get default height for kpi with pop widget", () => {
                expect(
                    getDashboardLayoutWidgetDefaultHeight(settings, "kpi", kpiWidgetPop.kpi),
                ).toMatchSnapshot();
            });

            it("should get default height for unknown widget", () => {
                expect(getDashboardLayoutWidgetDefaultHeight(settings, "unknown" as any)).toMatchSnapshot();
            });
        });
    });

    describe("getDashboardLayoutWidgetMinGridHeight", () => {
        describe.each([false, true])("with customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
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
                expect(
                    getDashboardLayoutWidgetMinGridHeight(settings, "kpi", kpiWidget.kpi),
                ).toMatchSnapshot();
            });

            it("should get min height for kpi with pop widget", () => {
                expect(
                    getDashboardLayoutWidgetMinGridHeight(settings, "kpi", kpiWidgetPop.kpi),
                ).toMatchSnapshot();
            });

            it("should get min height for unknown widget", () => {
                expect(getDashboardLayoutWidgetMinGridHeight(settings, "unknown" as any)).toMatchSnapshot();
            });
        });
    });

    describe("getDashboardLayoutWidgetMaxGridHeight", () => {
        describe.each([false, true])("with customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
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

            it("should get max height for unknown widget", () => {
                expect(getDashboardLayoutWidgetMaxGridHeight(settings, "unknown" as any)).toMatchSnapshot();
            });
        });
    });

    describe("getDashboardLayoutWidgetMinGridWidth", () => {
        describe.each([false, true])("is independent on customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
            it("should get minimum width for unknown visType", () => {
                expect(getDashboardLayoutWidgetMinGridWidth(settings, "insight")).toBe(4);
            });

            it("should get minimum width for kpi", () => {
                expect(getDashboardLayoutWidgetMinGridWidth(settings, "kpi")).toBe(2);
            });

            type Scenario = [string, string, VisType | undefined, number];
            const scenarios: Scenario[] = [
                ["KPI", "kpi", undefined, 2],
                ["Headline", "insight", "headline", 2],
                ["Column Chart", "insight", "column", 4],
                ["Bar Chart", "insight", "bar", 4],
                ["Line Chart", "insight", "line", 4],
                ["Area Chart", "insight", "area", 4],
                ["Combo Chart", "insight", "combo", 4],
                ["Combo2 Chart", "insight", "combo2", 4],
                ["Scatter Plot", "insight", "scatter", 4],
                ["Bubble Chart", "insight", "bubble", 4],
                ["Pie Chart", "insight", "pie", 4],
                ["Donut Chart", "insight", "donut", 4],
                ["Treemap", "insight", "treemap", 4],
                ["Heatmap", "insight", "heatmap", 4],
                ["Table", "insight", "table", 3],
                ["Geochart", "insight", "pushpin", 6],
            ];
            it.each(scenarios)(
                "should get default height for %s found in widgets by qualifier",
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
        it("should calculate widget height for selected gridHeight when FF enableKDWidgetCustomHeight is true", () => {
            const gridHeight = 11;
            expect(getDashboardLayoutItemHeightForGrid(gridHeight)).toMatchSnapshot();
        });
    });
});
