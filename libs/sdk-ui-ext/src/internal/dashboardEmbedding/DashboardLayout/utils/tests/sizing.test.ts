// (C) 2019-2020 GoodData Corporation
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { ResponsiveScreenType } from "@gooddata/sdk-backend-spi";
import {
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
    unifyDashboardLayoutColumnHeights,
} from "../sizing";
import { DashboardViewLayoutWidgetClass } from "../../interfaces/dashboardLayout";
import { ALL_SCREENS } from "../../../FluidLayout";
import { allWidgetClasses, dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../../mocks";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../constants";

const widgets = allWidgetClasses.map((widgetClass) => dashboardWidgetMock(widgetClass, widgetClass));
const rows = chunk(widgets, DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT).map((widgetsInRow) =>
    dashboardRowMock(
        widgetsInRow.map((widget, index) => [widget, { widthAsGridColumnsCount: index, heightAsRatio: 50 }]),
    ),
);
const dashboardLayout = dashboardLayoutMock(rows);

describe("sizing", () => {
    describe("getDashboardLayoutMinimumWidgetHeight", () => {
        it.each(allWidgetClasses)("should get default height for %s", (widgetClass) => {
            expect(getDashboardLayoutMinimumWidgetHeight(widgetClass)).toMatchSnapshot();
        });

        it("should get default height for unknown widget", () => {
            expect(
                getDashboardLayoutMinimumWidgetHeight("unknown" as DashboardViewLayoutWidgetClass),
            ).toMatchSnapshot();
        });
    });

    describe("unifyDashboardLayoutColumnHeights", () => {
        it("should unify dashboard layout column heights for various widgets and sizes", () => {
            expect(unifyDashboardLayoutColumnHeights(dashboardLayout)).toMatchSnapshot();
        });
    });

    describe("getDashboardLayoutContentHeightForRatioAndScreen", () => {
        const allGridWidths = Array.from(new Array(DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT)).map((_, i) => i);
        const createTestCasesForRatio = (ratio: number) =>
            flatMap(ALL_SCREENS, (screen) =>
                allGridWidths.map((width): [ResponsiveScreenType, number, number] => [screen, width, ratio]),
            );

        it.each(createTestCasesForRatio(100))(
            "should calculate widget height for %s screen with ratio 100",
            (screen, width, ratio) => {
                expect(
                    getDashboardLayoutContentHeightForRatioAndScreen(ratio, width, screen),
                ).toMatchSnapshot();
            },
        );

        it.each(createTestCasesForRatio(50))(
            "should calculate widget height for %s screen with ratio 50",
            (screen, width, ratio) => {
                expect(
                    getDashboardLayoutContentHeightForRatioAndScreen(ratio, width, screen),
                ).toMatchSnapshot();
            },
        );

        it("should calculate widget height for zero width and ratio", () => {
            expect(getDashboardLayoutContentHeightForRatioAndScreen(0, 0, "xl")).toMatchSnapshot();
        });
    });
});
