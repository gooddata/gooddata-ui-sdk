// (C) 2019 GoodData Corporation
import * as BucketNames from "../../base/constants/bucketNames";
import { IInsight, IVisualizationClass, newAttribute } from "@gooddata/sdk-model";

//
// Test insights
//

export const EMPTY_TITLE = "empty_title";

export const emptyInsight: IInsight = {
    insight: {
        visualizationClassUri: "column",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        title: "Empty insight",
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const dummyInsight: IInsight = {
    insight: {
        visualizationClassUri: "column",
        buckets: [
            {
                localIdentifier: "attribute",
                items: [newAttribute("attr1", a => a.localId("a1"))],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
        title: "Dummy insight with single attribute",
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithStacking: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleMeasureAndTwoViewBy: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithNoMeasureAndTwoViewBy: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithTwoMeasuresAndViewBy: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithTwoMeasuresAndTwoViewBy: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleMeasure: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleMeasureAndViewBy: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleMeasureAndViewByAndStack: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleMeasureAndStack: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

export const insightWithSingleAttribute: IInsight = {
    insight: {
        visualizationClassUri: "column",
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
        identifier: "myIdentifier",
        uri: "/gdc/md/mockproject/obj/123",
    },
};

//
// Visualization classes
//

export const dummyTableVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        identifier: "tableVis",
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
        url: "unknown",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};
