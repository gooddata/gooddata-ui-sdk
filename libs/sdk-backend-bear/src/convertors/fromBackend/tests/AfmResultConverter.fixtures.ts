// (C) 2020-2022 GoodData Corporation
import { IDimensionDescriptor } from "@gooddata/sdk-model";
import { GdcExecution } from "@gooddata/api-model-bear";

export const dimensions: IDimensionDescriptor[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                name: "Sum of Cases 1",
                                format: "#,##0.00",
                                localIdentifier: "2199f77137f842be9068f42cc60ba4cb",
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    name: "Continent",
                    localIdentifier: "c6270652abe94c23b86317df2d1c9413",
                    uri: "/gdc/md/projectId/obj/322",
                    identifier: "label.csv_coronavirusdate.continent",
                    ref: {
                        uri: "/gdc/md/projectId/obj/322",
                    },
                    formOf: {
                        ref: {
                            uri: "/gdc/md/projectId/obj/321",
                        },
                        name: "Continent",
                        uri: "/gdc/md/projectId/obj/321",
                        identifier: "attr.csv_coronavirusdate.continent",
                    },
                },
            },
            {
                attributeHeader: {
                    name: "mm/dd/yyyy (Date)",
                    localIdentifier: "d836083066194d519780fb3ed59698f8",
                    uri: "/gdc/md/projectId/obj/311",
                    identifier: "date.date.mmddyyyy",
                    type: "GDC.time.day_us",
                    ref: {
                        uri: "/gdc/md/projectId/obj/311",
                    },
                    formOf: {
                        ref: {
                            uri: "/gdc/md/projectId/obj/272",
                        },
                        name: "Date (Date)",
                        uri: "/gdc/md/projectId/obj/272",
                        identifier: "date.date",
                    },
                },
            },
        ],
    },
];

export const dimensionHeaders: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "04/07/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "04/07/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "04/07/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "05/01/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];

export const transformedDimensionHeaders_DDMMYYYY_SlashSeparated: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "07/04/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07/04/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07/04/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "01/05/2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];

export const transformedDimensionHeaders_DDMMYYYY_DashSeparated: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "07-04-2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07-04-2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07-04-2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "01-05-2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];

export const transformedDimensionHeaders_DDMMYYYY_DotSeparated: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "07.04.2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07.04.2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "07.04.2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "01.05.2020",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];

export const transformedDimensionHeaders_YYYYMMDD: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "2020-04-07",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "2020-04-07",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "2020-04-07",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "2020-05-01",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];

export const transformedDimensionHeaders_MDYY: GdcExecution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "CN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=44",
                },
            },
            {
                attributeHeaderItem: {
                    name: "JP",
                    uri: "/gdc/md/projectId/obj/319/elements?id=58",
                },
            },
            {
                attributeHeaderItem: {
                    name: "VN",
                    uri: "/gdc/md/projectId/obj/319/elements?id=114",
                },
            },
        ],
    ],
    [
        [
            {
                attributeHeaderItem: {
                    name: "Japan",
                    uri: "/gdc/md/projectId/obj/323/elements?id=59",
                },
            },
            {
                attributeHeaderItem: {
                    name: "China",
                    uri: "/gdc/md/projectId/obj/323/elements?id=46",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
            {
                attributeHeaderItem: {
                    name: "Vietnam",
                    uri: "/gdc/md/projectId/obj/323/elements?id=115",
                },
            },
        ],
        [
            {
                attributeHeaderItem: {
                    name: "4/7/20",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "4/7/20",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "4/7/20",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43927",
                },
            },
            {
                attributeHeaderItem: {
                    name: "5/1/20",
                    uri: "/gdc/md/projectId/obj/272/elements?id=43951",
                },
            },
        ],
        [
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
            {
                measureHeaderItem: {
                    name: "Sum of Cases",
                    order: 0,
                },
            },
        ],
    ],
];
