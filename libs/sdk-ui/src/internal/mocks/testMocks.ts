// (C) 2019 GoodData Corporation
import { DataLayer } from "@gooddata/gd-bear-client";
import { AFM, Execution, VisualizationObject } from "@gooddata/gd-bear-model";
import * as BucketNames from "../../base/constants/bucketNames";
import { IInsight, IVisualizationClass } from "@gooddata/sdk-model";
import { attribute } from "../../base/helpers/model";

export const emptyExecutionResponse: Execution.IExecutionResponses = {
    executionResponse: {
        dimensions: [],
        links: {
            executionResult: "",
        },
    },
    executionResult: null,
};

export const dummyDataSource: DataLayer.DataSource.IDataSource<Execution.IExecutionResponses> = {
    getData: () => Promise.resolve(emptyExecutionResponse),
    getPage: () => Promise.resolve(emptyExecutionResponse),
    getAfm: () => ({}),
    getFingerprint: () => "{}",
};

export const dummyTableResultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [],
        },
    ],
    sorts: [],
};

export const doubleMeasureHeadlineMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/headline",
    },
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
            localIdentifier: BucketNames.SECONDARY_MEASURES,
            items: [
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
    ],
};

export const secondMeasureHeadlineMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/headline",
    },
    buckets: [
        {
            localIdentifier: BucketNames.SECONDARY_MEASURES,
            items: [
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
    ],
};

//
// Test insights
//

export const EMPTY_TITLE = "empty_title";

export const emptyMdObject: VisualizationObject.IVisualizationObjectContent = {
    buckets: [],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
    },
};

export const emptyInsight: IInsight = {
    insight: {
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
        buckets: [
            {
                localIdentifier: "attribute",
                items: [attribute("attr1").localIdentifier("a1")],
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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

export const insightWithSingleMeasure: IInsight = {
    insight: {
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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
        visualizationClassIdentifier: "column",
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

export const dummyHeadlineVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        title: EMPTY_TITLE,
        identifier: "headlineVis",
        url: "local:headline",
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
