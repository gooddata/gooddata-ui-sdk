// (C) 2007-2018 GoodData Corporation
export const DRILL_EVENT_DATA_BY_MEASURE_URI = {
    drillContext: {
        element: "primaryValue",
        intersection: [
            {
                header: {
                    uri: "/gdc/md/project_id/obj/1",
                    identifier: "",
                },
                id: "m1",
                title: "Lost",
            },
        ],
        type: "headline",
        value: "42470571.16",
    },
    executionContext: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/project_id/obj/1",
                        },
                    },
                },
                localIdentifier: "m1",
            },
        ],
    },
};

export const DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER = {
    drillContext: {
        element: "primaryValue",
        intersection: [
            {
                header: {
                    identifier: "metric.lost",
                    uri: "",
                },
                id: "m1",
                title: "Lost",
            },
        ],
        type: "headline",
        value: "42470571.16",
    },
    executionContext: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            identifier: "metric.lost",
                        },
                    },
                },
                localIdentifier: "m1",
            },
        ],
    },
};

export const DRILL_EVENT_DATA_FOR_SECONDARY_ITEM = {
    drillContext: {
        element: "secondaryValue",
        intersection: [
            {
                header: {
                    identifier: "measure.found",
                    uri: "",
                },
                id: "m2",
                title: "Found",
            },
        ],
        type: "headline",
        value: "12345678",
    },
    executionContext: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            identifier: "measure.lost",
                        },
                    },
                },
                localIdentifier: "m1",
            },
            {
                definition: {
                    measure: {
                        item: {
                            identifier: "measure.found",
                        },
                    },
                },
                localIdentifier: "m2",
            },
        ],
    },
};
