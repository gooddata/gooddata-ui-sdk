// (C) 2019-2024 GoodData Corporation
import chunk from "lodash/chunk.js";
import flatMap from "lodash/flatMap.js";
import { newKpiWidget } from "@gooddata/sdk-backend-base";
import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    unifyDashboardLayoutItemHeights,
    getDashboardLayoutItemMaxGridWidth,
    getLayoutWithoutGridHeights,
    validateDashboardLayoutWidgetSize,
    getDashboardLayoutWidgetDefaultGridWidth,
} from "../sizing.js";
import { VisType } from "@gooddata/sdk-ui";
import {
    DashboardLayoutBuilder,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
} from "../../../../../_staging/dashboard/flexibleLayout/index.js";
import { idRef, newInsightDefinition, IDashboardLayoutSize, ScreenSize } from "@gooddata/sdk-model";
import { ALL_SCREENS } from "../../../../constants/index.js";
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

const layoutBuilder = DashboardLayoutBuilder.forNewLayout(undefined);
const measureRef = idRef("measure");
const kpiWidgetPop = newKpiWidget(measureRef, (w) =>
    w.title("Kpi Pop widget").comparisonType("previousPeriod").comparisonDirection("growIsBad"),
);

describe("sizing", () => {
    describe("unifyDashboardLayoutItemHeights", () => {
        it("should unify dashboard layout column heights for various item sizes", () => {
            chunk(allVisTypes, DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT).forEach((visTypesInRow) =>
                layoutBuilder.createSection((s) => {
                    visTypesInRow.forEach((visType, index) => {
                        s.createItem({ gridWidth: index, heightAsRatio: 50 }, (i) =>
                            i.newInsightWidget(idRef(visType)),
                        );
                    });
                    return s;
                }),
            );

            expect(
                unifyDashboardLayoutItemHeights(layoutBuilder.build(), undefined, undefined),
            ).toMatchSnapshot();
        });
    });

    describe("getLayoutWithoutGridHeights", () => {
        it("should remove gridHeight from dashboard layout item size", () => {
            const layout = DashboardLayoutBuilder.forNewLayout(undefined)
                .createSection((s) => s.createItem({ gridWidth: 10, gridHeight: 30 }))
                .build();
            expect(getLayoutWithoutGridHeights(layout)).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutItemHeightForRatioAndScreen", () => {
        const allGridWidths = Array.from(new Array(DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT)).map((_, i) => i);
        const createTestCasesForRatio = (heightAsRatio: number) =>
            flatMap(ALL_SCREENS, (screen) =>
                allGridWidths.map((gridWidth): [ScreenSize, IDashboardLayoutSize] => [
                    screen,
                    { gridWidth, heightAsRatio },
                ]),
            );

        it.each(createTestCasesForRatio(100))(
            "should calculate widget height for %s screen with ratio 100",
            (screen, size) => {
                expect(getDashboardLayoutItemHeightForRatioAndScreen(size, screen)).toMatchSnapshot();
            },
        );

        it.each(createTestCasesForRatio(50))(
            "should calculate widget height for %s screen with ratio 50",
            (screen, size) => {
                expect(getDashboardLayoutItemHeightForRatioAndScreen(size, screen)).toMatchSnapshot();
            },
        );

        it("should calculate widget height for zero width and ratio", () => {
            expect(
                getDashboardLayoutItemHeightForRatioAndScreen({ gridWidth: 0, heightAsRatio: 0 }, "xl"),
            ).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutWidgetDefaultGridWidth", () => {
        describe.each([false, true])("is independent on customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
            it("should get default width for insight with unknown vis type", () => {
                expect(getDashboardLayoutWidgetDefaultGridWidth(settings, "insight")).toBe(6);
            });

            it("should get default width for kpi", () => {
                expect(getDashboardLayoutWidgetDefaultGridWidth(settings, "kpi")).toBe(2);
            });

            type Scenario = [string, VisType, number];
            const scenarios: Scenario[] = [
                ["Headline", "headline", 2],
                ["Column Chart", "column", 6],
                ["Bar Chart", "bar", 6],
                ["Line Chart", "line", 6],
                ["Area Chart", "area", 6],
                ["Combo Chart", "combo", 6],
                ["Combo2 Chart", "combo2", 6],
                ["Scatter Plot", "scatter", 6],
                ["Bubble Chart", "bubble", 6],
                ["Pie Chart", "pie", 6],
                ["Donut Chart", "donut", 6],
                ["Treemap", "treemap", 6],
                ["Heatmap", "heatmap", 6],
                ["Table", "table", 12],
                ["Geochart", "pushpin", 6],
            ];
            it.each(scenarios)("should get default width for %s", (_name, visType, width) => {
                expect(
                    getDashboardLayoutWidgetDefaultGridWidth(
                        settings,
                        "insight",
                        newInsightDefinition(`local:${visType}`),
                    ),
                ).toBe(width);
            });
        });
    });

    describe("getDashboardLayoutItemMaxGridWidth", () => {
        const layoutFacade = DashboardLayoutBuilder.forNewLayout(undefined)
            .createSection((s) =>
                s
                    .createItem({ gridWidth: 3 })
                    .createItem({ gridWidth: 3 })
                    .createItem({ gridWidth: 3 })
                    .createItem({ gridWidth: 12 })
                    .createItem({ gridWidth: 3 }),
            )
            .createSection((s) => s.createItem({ gridWidth: 4 }).createItem({ gridWidth: 2 }))
            .facade();

        it("should get maximum size for a column with multiple widgets", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0)!.item(2)!, "xl");
            expect(actual).toEqual(6);
        });

        it("should get maximum size for a column in third virtual row", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0)!.item(4)!, "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with already full sized widget", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0)!.item(3)!, "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with some items on the right", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(1)!.item(0)!, "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with some items on the left", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(1)!.item(1)!, "xl");
            expect(actual).toEqual(8);
        });
    });

    describe("validateDashboardLayoutWidgetSize", () => {
        const settings = {
            enableKDWidgetCustomHeight: true,
        };
        type Scenario = [string, VisType, number, number | undefined, number, number | undefined];
        const scenarios: Scenario[] = [
            ["Headline with too big height", "headline", 2, 80, 2, 40],
            ["Column Chart with too low width", "column", 1, 14, 2, 14],
            ["Table with too low height", "table", 3, 10, 3, 12],
            ["Geochart with too big width and undefined height", "pushpin", 14, undefined, 12, undefined],
        ];
        it.each(scenarios)(
            "should get valid width and height for %s",
            (_name, visType, currentWidth, currentHeight, validWidth, validHeight) => {
                expect(
                    validateDashboardLayoutWidgetSize(
                        currentWidth,
                        currentHeight,
                        "insight",
                        newInsightDefinition(`local:${visType}`),
                        settings,
                    ),
                ).toEqual({
                    validWidth,
                    validHeight,
                });
            },
        );

        it("should validate kpi size", () => {
            expect(validateDashboardLayoutWidgetSize(2, 6, "kpi", kpiWidgetPop.kpi, settings)).toEqual({
                validWidth: 2,
                validHeight: 10,
            });
        });
    });
});
