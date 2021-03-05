// (C) 2019-2021 GoodData Corporation

import { convertDashboard, convertFilterContext, convertWidget } from "../DashboardConverter";
import {
    emptyDashboard,
    dashboardWithFilterContext,
    dashboardWithLayoutAndSectionHeaders,
    dashboardWithLayoutAndEmptySectionHeaders,
    dashboardWithExtendedDateFilterConfig,
    dashboardWithTempFilterContext,
    dashboardFilterContext,
    dashboardTempFilterContext,
    widgetHeadline,
    widgetKpi,
    widgetKpiWithDrilling,
    dashboardWithLayoutAndCustomGridHeight,
} from "./DashboardConverter.fixtures";

describe("dashboard converter", () => {
    describe("convert dashboard", () => {
        it("should convert empty dashboard", () => {
            const convertedDashboard = convertDashboard(emptyDashboard);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with filter context", () => {
            const convertedDashboard = convertDashboard(dashboardWithFilterContext);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with export temp filter context", () => {
            const convertedDashboard = convertDashboard(dashboardWithTempFilterContext);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with layout", () => {
            const convertedDashboard = convertDashboard(dashboardWithLayoutAndSectionHeaders);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with layout with custom gridHeight", () => {
            const convertedDashboard = convertDashboard(dashboardWithLayoutAndCustomGridHeight);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with layout with empty row headers", () => {
            const convertedDashboard = convertDashboard(dashboardWithLayoutAndEmptySectionHeaders);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert dashboard with extended date filters config", () => {
            const convertedDashboard = convertDashboard(dashboardWithExtendedDateFilterConfig);
            expect(convertedDashboard).toMatchSnapshot();
        });
    });

    describe("convert widget", () => {
        it("should convert visualization widget", () => {
            const convertedDashboard = convertWidget(widgetHeadline);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert kpi widget", () => {
            const convertedDashboard = convertWidget(widgetKpi);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert kpi widget with drilling", () => {
            const convertedDashboard = convertWidget(widgetKpiWithDrilling);
            expect(convertedDashboard).toMatchSnapshot();
        });
    });

    describe("convert filter context", () => {
        it("should convert filter context", () => {
            const convertedDashboard = convertFilterContext(dashboardFilterContext);
            expect(convertedDashboard).toMatchSnapshot();
        });

        it("should convert temp filter context", () => {
            const convertedDashboard = convertFilterContext(dashboardTempFilterContext);
            expect(convertedDashboard).toMatchSnapshot();
        });
    });
});
