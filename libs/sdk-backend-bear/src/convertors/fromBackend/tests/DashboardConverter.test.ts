// (C) 2019-2021 GoodData Corporation
import * as uuid from "uuid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { convertDashboard } from "../DashboardConverter/index.js";
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
} from "./DashboardConverter.fixtures.js";

describe("dashboard converter", () => {
    describe("convert dashboard", () => {
        beforeEach(() => {
            vi.spyOn(uuid, "v4").mockReturnValue("mocked-uuid");
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

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
