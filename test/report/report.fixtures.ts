// (C) 2019 GoodData Corporation
import { AFM } from "@gooddata/typings";

export const exportedAfm: AFM.IAfm = {
    measures: [
        {
            localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
            definition: {
                measure: {
                    item: {
                        uri: "/gdc/md/projectId/obj/16203",
                    },
                },
            },
            alias: "Conversion",
        },
    ],
    attributes: [
        {
            displayForm: {
                uri: "/gdc/md/projectId/obj/15358",
            },
            localIdentifier: "645bf676a4854a32b694390bba9bd63c",
        },
    ],
    filters: [
        {
            positiveAttributeFilter: {
                displayForm: {
                    uri: "bar",
                },
                in: ["/gdc/md/bar1", "/gdc/md/bar2"],
            },
        },
        {
            negativeAttributeFilter: {
                displayForm: {
                    identifier: "foo",
                },
                notIn: ["foo1", "foo2"],
                textFilter: true,
            },
        },
        {
            absoluteDateFilter: {
                dataSet: {
                    uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/330",
                },
                from: "2011-01-01",
                to: "2011-12-31",
            },
        },
        {
            relativeDateFilter: {
                to: 0,
                from: -3,
                granularity: "GDC.time.quarter",
                dataSet: {
                    uri: "/gdc/md/myproject/obj/921",
                },
            },
        },
        {
            measureValueFilter: {
                measure: {
                    localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
                },
                condition: {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 350000,
                    },
                },
            },
        },
    ],
};
