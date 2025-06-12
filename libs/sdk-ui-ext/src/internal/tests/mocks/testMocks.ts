// (C) 2019-2024 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import { IInsight, IInsightDefinition, IVisualizationClass, newAttribute } from "@gooddata/sdk-model";

//
// Test insight definitions
//

export const EMPTY_TITLE = "empty_title";

export const emptyInsight: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        title: "Empty insight",
    },
};

export const dummyInsight: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: "attribute",
                items: [newAttribute("attr1", (a) => a.localId("a1"))],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single attribute",
    },
};

export const insightWithSinglePrimaryAndSecondaryMeasureNoIdentifier: IInsight = {
    insight: {
        visualizationUrl: "local:headline",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1269",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m2",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        identifier: undefined,
        uri: "/gdc/md/project/obj/1234",
        ref: {
            identifier: undefined,
        },
        title: "Dummy insight with single primary and secondary measure",
    },
};

export const insightWithSinglePrimaryAndSecondaryMeasure: IInsight = {
    insight: {
        visualizationUrl: "local:headline",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1269",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m2",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        identifier: "dummy_insight",
        uri: "/gdc/md/project/obj/1234",
        ref: {
            identifier: "dummy_insight",
        },
        title: "Dummy insight with single primary and secondary measure",
    },
};

export const insightWithStacking: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1280",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single attribute",
    },
};

export const insightWithSingleMeasureAndTwoViewBy: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1280",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with two viewby attributes",
    },
};

export const insightWithTwoMeasuresAndViewBy: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m2",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1280",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with two viewby attributes",
    },
};

export const insightWithTwoMeasuresAndTwoViewBy: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m2",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1280",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with two viewby attributes",
    },
};

export const insightWithSingleMeasure: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithSingleSecondaryMeasure: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithSingleMeasureAndViewBy: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithSingleMeasureAndViewByAndStack: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithSingleMeasureAndStack: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.STACK,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithSingleAttribute: IInsightDefinition = {
    insight: {
        visualizationUrl: "column",
        buckets: [
            {
                localIdentifier: BucketNames.VIEW,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1027",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure",
    },
};

export const insightWithNoMeasureAndOneAttribute: IInsightDefinition = {
    insight: {
        visualizationUrl: "table",
        buckets: [
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with no measure and one attribute",
    },
};

export const insightWithOneColumnAndOneAttribute: IInsightDefinition = {
    insight: {
        visualizationUrl: "table",
        buckets: [
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.COLUMNS,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1_clone",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with one column and one attribute",
    },
};

export const insightWithSingleMeasureAndOneAttribute: IInsightDefinition = {
    insight: {
        visualizationUrl: "table",
        buckets: [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/project/obj/1279",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single measure and one attribute",
    },
};

export const insightWithNoMeasureAndOneColumn: IInsightDefinition = {
    insight: {
        visualizationUrl: "table",
        buckets: [
            {
                localIdentifier: BucketNames.COLUMNS,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/project/obj/1028",
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with no measure and one column",
    },
};

//
// Visualization classes
//

export const dummyTableVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        identifier: "tableVis",
        uri: "test",
        url: "local:table",
        title: EMPTY_TITLE,
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};

export const dummyColumnVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        identifier: "columnVis",
        uri: "test",
        title: EMPTY_TITLE,
        url: "local:column",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};

export const dummyUnknownTypeVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        title: EMPTY_TITLE,
        identifier: "fun",
        uri: "test",
        url: "unknown",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};
