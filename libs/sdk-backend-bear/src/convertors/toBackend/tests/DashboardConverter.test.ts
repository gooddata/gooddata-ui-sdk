// (C) 2019-2022 GoodData Corporation

import {
    convertDashboard,
    convertDrill,
    convertFilterContext,
    convertScheduledMail,
    convertWidget,
} from "../DashboardConverter";
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
    drillToDashboardWithDrillFromMeasure,
    drillToDashboardWithDrillFromAttribute,
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

    describe("convert drill", () => {
        it("should convert drill to dashboard with drill from measure", () => {
            const convertedDrill = convertDrill(drillToDashboardWithDrillFromMeasure);
            expect(convertedDrill).toMatchSnapshot();
        });

        it("should convert drill to dashboard with drill from attribute", () => {
            const convertedDrill = convertDrill(drillToDashboardWithDrillFromAttribute);
            expect(convertedDrill).toMatchSnapshot();
        });
    });

    describe("convert scheduled mail", () => {
        it("converts scheduled mail object with attachments", () => {
            const convertedScheduledMail = convertScheduledMail({
                bcc: ["bcc_recipient1@gd.com", "bcc_recipient1@gd.com"],
                body: "Scheduled mail body",
                description: "Scheduled mail description",
                lastSuccessful: "YYYY-MM-DD HH:mm:ss",
                subject: "Scheduled mail subject",
                title: "Scheduled mail title",
                to: ["to_recipient1@gd.com", "to_recipient1@gd.com"],
                attachments: [
                    {
                        dashboard: {
                            uri: "dashboard/uri",
                        },
                        filterContext: {
                            uri: "dashboard/uri",
                        },
                        format: "pdf",
                    },
                    {
                        exportOptions: {
                            includeFilters: false,
                            mergeHeaders: true,
                        },
                        filterContext: {
                            uri: "context/uri",
                        },
                        formats: ["csv", "xlsx"],
                        widget: {
                            uri: "widget/uri",
                        },
                        widgetDashboard: {
                            uri: "dashboard/uri",
                        },
                    },
                    {
                        formats: ["csv"],
                        widget: {
                            uri: "widget/uri",
                        },
                        widgetDashboard: {
                            uri: "dashboard/uri",
                        },
                    },
                ],
                unlisted: false,
                unsubscribed: ["unsubscribed@gd.com"],
                when: {
                    endDate: "2023-01-01",
                    recurrence: "recurency string",
                    startDate: "2022-01-01",
                    timeZone: "CET",
                },
            });

            expect(convertedScheduledMail).toEqual({
                scheduledMail: {
                    content: {
                        attachments: [
                            {
                                kpiDashboardAttachment: {
                                    filterContext: "dashboard/uri",
                                    format: "pdf",
                                    uri: "dashboard/uri",
                                },
                            },
                            {
                                visualizationWidgetAttachment: {
                                    dashboardUri: "dashboard/uri",
                                    exportOptions: {
                                        includeFilterContext: "no",
                                        mergeHeaders: "yes",
                                    },
                                    filterContext: "context/uri",
                                    formats: ["csv", "xlsx"],
                                    uri: "widget/uri",
                                },
                            },
                            {
                                visualizationWidgetAttachment: {
                                    dashboardUri: "dashboard/uri",
                                    formats: ["csv"],
                                    uri: "widget/uri",
                                },
                            },
                        ],
                        bcc: ["bcc_recipient1@gd.com", "bcc_recipient1@gd.com"],
                        body: "Scheduled mail body",
                        lastSuccessfull: "YYYY-MM-DD HH:mm:ss",
                        subject: "Scheduled mail subject",
                        to: ["to_recipient1@gd.com", "to_recipient1@gd.com"],
                        unsubscribed: ["unsubscribed@gd.com"],
                        when: {
                            endDate: "2023-01-01",
                            recurrency: "recurency string",
                            startDate: "2022-01-01",
                            timeZone: "CET",
                        },
                    },
                    meta: {
                        summary: "Scheduled mail description",
                        title: "Scheduled mail title",
                        unlisted: 0,
                    },
                },
            });
        });
    });
});
