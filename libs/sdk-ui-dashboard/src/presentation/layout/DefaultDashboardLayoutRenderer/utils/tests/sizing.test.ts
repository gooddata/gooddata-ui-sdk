// (C) 2019-2021 GoodData Corporation
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { IDashboardLayoutSize, ScreenSize, AnalyticalWidgetType } from "@gooddata/sdk-backend-spi";
import { newKpiWidget } from "@gooddata/sdk-backend-base";
import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    unifyDashboardLayoutItemHeights,
    getDashboardLayoutItemMaxGridWidth,
    getDashboardLayoutWidgetDefaultGridWidth,
    getDashboardLayoutWidgetMinGridWidth,
    getDashboardLayoutWidgetDefaultHeight,
    getDashboardLayoutItemHeightForGrid,
    getDashboardLayoutItemHeight,
    getLayoutWithoutGridHeights,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMaxGridHeight,
    validateDashboardLayoutWidgetSize,
} from "../sizing";
import { VisType } from "@gooddata/sdk-ui";
import { DashboardLayoutBuilder } from "../../builder/layout";
import { idRef, newInsightDefinition } from "@gooddata/sdk-model";
import {
    ALL_SCREENS,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_VIS_TYPE,
} from "../../../../constants";

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

    describe("unifyDashboardLayoutItemHeights", () => {
        it("should unify dashboard layout column heights for various item sizes", () => {
            chunk(allVisTypes, DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT).forEach((visTypesInRow) =>
                layoutBuilder.addSection((s) => {
                    visTypesInRow.forEach((visType, index) => {
                        s.addItem({ gridWidth: index, heightAsRatio: 50 }, (i) =>
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
                .addSection((s) => s.addItem({ gridWidth: 10, gridHeight: 30 }))
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

            it.each([
                ["Headline", DASHBOARD_LAYOUT_VIS_TYPE.headline, 2],
                ["Column Chart", DASHBOARD_LAYOUT_VIS_TYPE.column, 6],
                ["Bar Chart", DASHBOARD_LAYOUT_VIS_TYPE.bar, 6],
                ["Line Chart", DASHBOARD_LAYOUT_VIS_TYPE.line, 6],
                ["Area Chart", DASHBOARD_LAYOUT_VIS_TYPE.area, 6],
                ["Combo Chart", DASHBOARD_LAYOUT_VIS_TYPE.combo, 6],
                ["Combo2 Chart", DASHBOARD_LAYOUT_VIS_TYPE.combo2, 6],
                ["Scatter Plot", DASHBOARD_LAYOUT_VIS_TYPE.scatter, 6],
                ["Bubble Chart", DASHBOARD_LAYOUT_VIS_TYPE.bubble, 6],
                ["Pie Chart", DASHBOARD_LAYOUT_VIS_TYPE.pie, 6],
                ["Donut Chart", DASHBOARD_LAYOUT_VIS_TYPE.donut, 6],
                ["Treemap", DASHBOARD_LAYOUT_VIS_TYPE.treemap, 6],
                ["Heatmap", DASHBOARD_LAYOUT_VIS_TYPE.heatmap, 6],
                ["Table", DASHBOARD_LAYOUT_VIS_TYPE.table, 12],
                ["Geochart", DASHBOARD_LAYOUT_VIS_TYPE.pushpin, 6],
            ])("should get default width for %s", (_name, visType, width) => {
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

            it.each([
                ["KPI", "kpi", undefined, 2],
                ["Headline", "insight", DASHBOARD_LAYOUT_VIS_TYPE.headline, 2],
                ["Column Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.column, 4],
                ["Bar Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.bar, 4],
                ["Line Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.line, 4],
                ["Area Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.area, 4],
                ["Combo Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.combo, 4],
                ["Combo2 Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.combo2, 4],
                ["Scatter Plot", "insight", DASHBOARD_LAYOUT_VIS_TYPE.scatter, 4],
                ["Bubble Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.bubble, 4],
                ["Pie Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.pie, 4],
                ["Donut Chart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.donut, 4],
                ["Treemap", "insight", DASHBOARD_LAYOUT_VIS_TYPE.treemap, 4],
                ["Heatmap", "insight", DASHBOARD_LAYOUT_VIS_TYPE.heatmap, 4],
                ["Table", "insight", DASHBOARD_LAYOUT_VIS_TYPE.table, 3],
                ["Geochart", "insight", DASHBOARD_LAYOUT_VIS_TYPE.pushpin, 6],
            ])(
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
            .addSection((s) =>
                s
                    .addItem({ gridWidth: 3 })
                    .addItem({ gridWidth: 3 })
                    .addItem({ gridWidth: 3 })
                    .addItem({ gridWidth: 12 })
                    .addItem({ gridWidth: 3 }),
            )
            .addSection((s) => s.addItem({ gridWidth: 4 }).addItem({ gridWidth: 2 }))
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
        it.each([
            ["Headline with too big height", DASHBOARD_LAYOUT_VIS_TYPE.headline, 2, 80, 2, 40],
            ["Column Chart with too low width", DASHBOARD_LAYOUT_VIS_TYPE.column, 2, 14, 4, 14],
            ["Table with too low height", DASHBOARD_LAYOUT_VIS_TYPE.table, 3, 10, 3, 12],
            [
                "Geochart with too big width and undefined height",
                DASHBOARD_LAYOUT_VIS_TYPE.pushpin,
                14,
                undefined,
                12,
                undefined,
            ],
        ])(
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
