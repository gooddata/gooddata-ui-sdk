// (C) 2019-2022 GoodData Corporation
import { newKpiWidget } from "@gooddata/sdk-backend-base";
import {
    getDashboardLayoutWidgetDefaultHeight,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMaxGridHeight,
} from "../sizing";
import { VisType } from "@gooddata/sdk-ui";
import { idRef, newInsightDefinition } from "@gooddata/sdk-model";

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
});
