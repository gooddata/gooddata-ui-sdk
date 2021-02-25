// (C) 2019-2021 GoodData Corporation
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { IDashboardLayoutSize, ScreenSize, WidgetType } from "@gooddata/sdk-backend-spi";
import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    unifyDashboardLayoutItemHeights,
    getDashboardLayoutItemMaxGridWidth,
    getDashboardLayoutWidgetDefaultGridWidth,
    getDashboardLayoutWidgetMinGridWidth,
    getDashboardLayoutWidgetDefaultHeight,
} from "../sizing";
import { ALL_SCREENS } from "../..";
import {
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_VIS_TYPE,
} from "../../../DashboardLayout/constants";
import { VisType } from "@gooddata/sdk-ui";
import { DashboardLayoutBuilder } from "../../builder/layout";
import { idRef } from "@gooddata/sdk-model";

export const allVisTypes: VisType[] = [
    "alluvial",
    "area",
    "bar",
    "bubble",
    "bullet",
    "column",
    "combo",
    "combo2",
    "donut",
    "funnel",
    "geo",
    "headline",
    "heatmap",
    "histogram",
    "line",
    "pareto",
    "pushpin",
    "pie",
    "scatter",
    "table",
    "treemap",
    "waterfall",
    "xirr",
];

const layoutBuilder = DashboardLayoutBuilder.forNewLayout();

chunk(allVisTypes, DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT).forEach((visTypesInRow) =>
    layoutBuilder.addSection((s) => {
        visTypesInRow.forEach((visType, index) => {
            s.addItem({ gridWidth: index, heightAsRatio: 50 }, (i) => i.newInsightWidget(idRef(visType)));
        });
        return s;
    }),
);

describe("sizing", () => {
    describe("getDashboardLayoutWidgetDefaultHeight", () => {
        it.each(allVisTypes)("should get default height for insight widget %s", (visType) => {
            expect(getDashboardLayoutWidgetDefaultHeight("insight", visType)).toMatchSnapshot();
        });

        it("should get default height for kpi widget", () => {
            expect(getDashboardLayoutWidgetDefaultHeight("kpi")).toMatchSnapshot();
        });

        it("should get default height for unknown widget", () => {
            expect(getDashboardLayoutWidgetDefaultHeight("unknown" as any)).toMatchSnapshot();
        });
    });

    describe("unifyDashboardLayoutItemHeights", () => {
        it("should unify dashboard layout column heights for various item sizes", () => {
            expect(unifyDashboardLayoutItemHeights(layoutBuilder.build())).toMatchSnapshot();
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
        it("should get default width for insight with unknown vis type", () => {
            expect(getDashboardLayoutWidgetDefaultGridWidth("insight")).toBe(6);
        });

        it("should get default width for kpi", () => {
            expect(getDashboardLayoutWidgetDefaultGridWidth("kpi")).toBe(2);
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
            expect(getDashboardLayoutWidgetDefaultGridWidth("insight", visType as any)).toBe(width);
        });
    });

    describe("getDashboardLayoutWidgetMinGridWidth", () => {
        it("should get minimum width for uknown visType", () => {
            expect(getDashboardLayoutWidgetMinGridWidth("insight")).toBe(4);
        });

        it("should get minimum width for kpi", () => {
            expect(getDashboardLayoutWidgetMinGridWidth("kpi")).toBe(2);
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
                expect(getDashboardLayoutWidgetMinGridWidth(widgetType as WidgetType, visType)).toBe(width);
            },
        );
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
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0).item(2), "xl");
            expect(actual).toEqual(6);
        });

        it("should get maximum size for a column in third virtual row", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0).item(4), "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with already full sized widget", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(0).item(3), "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with some items on the right", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(1).item(0), "xl");
            expect(actual).toEqual(12);
        });

        it("should get maximum size for a column with some items on the left", () => {
            const actual = getDashboardLayoutItemMaxGridWidth(layoutFacade.section(1).item(1), "xl");
            expect(actual).toEqual(8);
        });
    });
});
