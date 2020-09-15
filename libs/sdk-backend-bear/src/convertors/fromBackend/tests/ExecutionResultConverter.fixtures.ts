// (C) 2020 GoodData Corporation
import { GdcExecution } from "@gooddata/api-model-bear";

export const dimensions: GdcExecution.IResultDimension[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                name: "<button>Lost</button> ...",
                                format: "#,##0.00",
                                localIdentifier: "lostMetric",
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                identifier: "af2Ewj9Re2vK",
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Won",
                                format: "#,##0.00",
                                localIdentifier: "wonMetric",
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
                                identifier: "afSEwRwdbMeQ",
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Expected",
                                format: "#,##0.00",
                                localIdentifier: "expectedMetric",
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1285",
                                identifier: "alUEwmBtbwSh",
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
                    name: "Year (Created)",
                    localIdentifier: "yearCreatedAttribute",
                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/158",
                    identifier: "created.aag81lMifn6q",
                    formOf: {
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/157",
                        identifier: "created",
                        name: "Year created",
                    },
                },
            },
        ],
    },
];
