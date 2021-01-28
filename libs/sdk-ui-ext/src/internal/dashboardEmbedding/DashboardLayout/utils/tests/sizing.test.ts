// (C) 2019-2021 GoodData Corporation
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import { ResponsiveScreenType } from "@gooddata/sdk-backend-spi";
import {
    getDashboardLayoutContentHeightForRatioAndScreen,
    getDashboardLayoutMinimumWidgetHeight,
    unifyDashboardLayoutColumnHeights,
} from "../sizing";
import { DashboardViewLayoutWidgetClass } from "../../interfaces/dashboardLayoutSizing";
import { ALL_SCREENS } from "../../../FluidLayout";
import { allWidgetClasses, dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../../mocks";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../constants";
import { IFluidLayoutSize } from "../../../../../../../sdk-backend-spi/dist/workspace/dashboards/layout/fluidLayout";

const widgets = allWidgetClasses.map((widgetClass) => dashboardWidgetMock(widgetClass, widgetClass));
const rows = chunk(widgets, DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT).map((widgetsInRow) =>
    dashboardRowMock(
        widgetsInRow.map((widget, index) => [
            widget,
            { xl: { widthAsGridColumnsCount: index, heightAsRatio: 50 } },
        ]),
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
        const createTestCasesForRatio = (heightAsRatio: number) =>
            flatMap(ALL_SCREENS, (screen) =>
                allGridWidths.map((widthAsGridColumnsCount): [ResponsiveScreenType, IFluidLayoutSize] => [
                    screen,
                    { widthAsGridColumnsCount, heightAsRatio },
                ]),
            );

        it.each(createTestCasesForRatio(100))(
            "should calculate widget height for %s screen with ratio 100",
            (screen, size) => {
                expect(getDashboardLayoutContentHeightForRatioAndScreen(size, screen)).toMatchSnapshot();
            },
        );

        it.each(createTestCasesForRatio(50))(
            "should calculate widget height for %s screen with ratio 50",
            (screen, size) => {
                expect(getDashboardLayoutContentHeightForRatioAndScreen(size, screen)).toMatchSnapshot();
            },
        );

        it("should calculate widget height for zero width and ratio", () => {
            expect(
                getDashboardLayoutContentHeightForRatioAndScreen(
                    { widthAsGridColumnsCount: 0, heightAsRatio: 0 },
                    "xl",
                ),
            ).toMatchSnapshot();
        });
    });
});
