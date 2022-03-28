// (C) 2022 GoodData Corporation

import { GdcScheduledMail } from "@gooddata/api-model-bear";
import { convertScheduledMail } from "../scheduledMails";

describe("scheduled mail converter", () => {
    it("converts scheduled email object", () => {
        const scheduledMail: GdcScheduledMail.IWrappedScheduledMail = {
            scheduledMail: {
                content: {
                    when: {
                        recurrency: "recurency string",
                        startDate: "2022-01-01",
                        timeZone: "CET",
                        endDate: "2023-01-01",
                    },
                    to: ["to_recipient1@gd.com", "to_recipient1@gd.com"],
                    bcc: ["bcc_recipient1@gd.com", "bcc_recipient1@gd.com"],
                    unsubscribed: ["unsubscribed@gd.com"],
                    subject: "Scheduled mail subject",
                    body: "Scheduled mail body",
                    attachments: [
                        {
                            kpiDashboardAttachment: {
                                uri: "dashboard/uri",
                                format: "pdf",
                                filterContext: "dashboard/uri",
                            },
                        },
                        {
                            visualizationWidgetAttachment: {
                                uri: "widget/uri",
                                dashboardUri: "dashboard/uri",
                                formats: ["csv", "xlsx"],
                                filterContext: "context/uri",
                                exportOptions: {
                                    mergeHeaders: "yes",
                                    includeFilterContext: "no",
                                },
                            },
                        },
                        {
                            visualizationWidgetAttachment: {
                                uri: "widget/uri",
                                dashboardUri: "dashboard/uri",
                                formats: ["csv"],
                            },
                        },
                    ],
                    lastSuccessfull: "YYYY-MM-DD HH:mm:ss",
                },
                meta: {
                    title: "Scheduled mail title",
                },
            },
        };

        const result = convertScheduledMail(scheduledMail);

        expect(result).toEqual({
            bcc: ["bcc_recipient1@gd.com", "bcc_recipient1@gd.com"],
            body: "Scheduled mail body",
            description: undefined,
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
    });
});
