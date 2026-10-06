// (C) 2026 GoodData Corporation

import { type AiReportPart } from "@gooddata/api-client-tiger";

export const REPORT_COPILOT_SAMPLE_PART: AiReportPart = {
    type: "report",
    report: {
        id: "top-customers-h2-2025-m644lc",
        type: "report",
        title: "Top Customers — H2 2025",
        description: "A focused view of the leading customers and customer mix for the second half of 2025.",
        period: {
            start: "2025-07-01",
            end: "2025-12-31",
        },
        pages: [
            {
                id: "page1",
                kind: "cover",
                format: "widescreen",
                layout: {
                    column: [
                        {
                            id: "coverTitle",
                            weight: 2,
                            heading: "{reportTitle}",
                        },
                        {
                            id: "coverSubtitle",
                            weight: 1,
                            heading: "{periodStart} – {periodEnd}",
                        },
                        {
                            weight: 1,
                            row: [
                                {
                                    id: "footerLogo",
                                    weight: 1,
                                    image: {
                                        url: "{{logo}}",
                                        alt_text: "Logo",
                                        fit: "contain",
                                        style: {
                                            horizontal_align: "start",
                                            vertical_align: "end",
                                        },
                                    },
                                },
                                {
                                    id: "footerPageNumber",
                                    weight: 8,
                                    paragraph: "{pageNumber} / {totalPages}",
                                    style: {
                                        horizontal_align: "end",
                                        vertical_align: "end",
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
            {
                id: "page2",
                kind: "content",
                format: "widescreen",
                layout: {
                    column: [
                        {
                            id: "pageTitle",
                            weight: 2,
                            heading: "Customer Trends and Mix",
                        },
                        {
                            weight: 9,
                            row: [
                                {
                                    weight: 2,
                                    row: [
                                        {
                                            id: "widget1",
                                            visualization: "customers_trend",
                                            show_title: true,
                                        },
                                        {
                                            id: "widget2",
                                            visualization: "percentage_of_customers_by_region",
                                            show_title: true,
                                        },
                                    ],
                                },
                                {
                                    id: "summary",
                                    weight: 1,
                                    paragraph: {
                                        prompt: "Focus on customer activity over time and regional composition.",
                                        text: "These charts provide context for how the customer base evolved through H2 2025 and how it was distributed geographically. Together they help distinguish changes in customer activity from shifts in regional mix.",
                                        generated_at: "2026-09-30T08:15:06Z",
                                    },
                                },
                            ],
                        },
                        {
                            weight: 1,
                            row: [
                                {
                                    id: "footerLogo",
                                    weight: 1,
                                    image: {
                                        url: "{{logo}}",
                                        alt_text: "Logo",
                                        fit: "contain",
                                        style: {
                                            horizontal_align: "start",
                                            vertical_align: "end",
                                        },
                                    },
                                },
                                {
                                    id: "footerPageNumber",
                                    weight: 8,
                                    paragraph: "{pageNumber} / {totalPages}",
                                    style: {
                                        horizontal_align: "end",
                                        vertical_align: "end",
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    page_count: 2,
    saved_report_id: null,
};
