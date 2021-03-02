// (C) 2019-2021 GoodData Corporation

import { convertDashboard } from "../DashboardConverter";
import {
    dashboardWithoutLayout,
    dashboardWithoutLayoutDependencies,
    exportFilterContext,
    emptyDashboard,
    exportTempFilterContext,
    dashboardWithExportTempFilterContextDependencies,
    emptyDashboardDependencies,
    dashboardWithFilterContext,
    dashboardWithFilterContextDependencies,
    dashboardWithExportFilterContextDependencies,
    visualizationClasses,
    dashboardWithLayout,
    dashboardWithLayoutDependencies,
    dashboardWithExtendedDateFilterConfig,
    dashboardWithLayoutAndCustomGridHeight,
} from "./DashboardConverter.fixtures";

describe("dashboard converter", () => {
    describe("convert dashboard", () => {
        it("should convert empty dashboard", () => {
            const convertedDashboard = convertDashboard(emptyDashboard, emptyDashboardDependencies);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with filter context", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithFilterContext,
                dashboardWithFilterContextDependencies,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should override dashboard filter context with export filter context", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithFilterContext,
                dashboardWithExportFilterContextDependencies,
                [],
                exportFilterContext.filterContext.meta.uri,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with export temp filter context", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithFilterContext,
                dashboardWithExportTempFilterContextDependencies,
                [],
                exportTempFilterContext.tempFilterContext.uri,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard without layout, and create implicit layout", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithoutLayout,
                dashboardWithoutLayoutDependencies,
                visualizationClasses,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with layout", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithLayout,
                dashboardWithLayoutDependencies,
                visualizationClasses,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with layout with custom gridHeight", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithLayoutAndCustomGridHeight,
                dashboardWithLayoutDependencies,
                visualizationClasses,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with extended date filters config", () => {
            const convertedDashboard = convertDashboard(
                dashboardWithExtendedDateFilterConfig,
                emptyDashboardDependencies,
            );
            expect(convertedDashboard).toMatchSnapshot();
        });
    });
});
