// (C) 2019-2022 GoodData Corporation
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { newKpiWidget } from "@gooddata/sdk-backend-base";
import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    unifyDashboardLayoutItemHeights,
    getDashboardLayoutItemMaxGridWidth,
    getDashboardLayoutItemHeightForGrid,
    getDashboardLayoutItemHeight,
    getLayoutWithoutGridHeights,
    validateDashboardLayoutWidgetSize,
    getDashboardLayoutWidgetDefaultGridWidth,
    getDashboardLayoutWidgetMinGridWidth,
} from "../sizing";
import { VisType } from "@gooddata/sdk-ui";
import {
    DashboardLayoutBuilder,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
} from "../../../../../_staging/dashboard/fluidLayout";
import {
    idRef,
    newInsightDefinition,
    AnalyticalWidgetType,
    IDashboardLayoutSize,
    ScreenSize,
} from "@gooddata/sdk-model";
import { ALL_SCREENS } from "../../../../constants";

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

const layoutBuilder = DashboardLayoutBuilder.forNewLayout();
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

            expect(unifyDashboardLayoutItemHeights(layoutBuilder.build())).toMatchSnapshot();
        });
    });

    describe("getLayoutWithoutGridHeights", () => {
        it("should remove gridHeight from dashboard layout item size", () => {
            const layout = DashboardLayoutBuilder.forNewLayout()
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

    describe("getDashboardLayoutWidgetMinGridWidth", () => {
        describe.each([false, true])("is independent on customHeight %s", (enableKDWidgetCustomHeight) => {
            const settings = {
                enableKDWidgetCustomHeight,
            };
            it("should get minimum width for uknown visType", () => {
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

    describe("getDashboardLayoutItemMaxGridWidth", () => {
        const layoutFacade = DashboardLayoutBuilder.forNewLayout()
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
            ["Column Chart with too low width", "column", 2, 14, 4, 14],
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
