// (C) 2019 GoodData Corporation
import { DataLayer } from "@gooddata/gd-bear-client";
import { AFM, Execution, VisualizationObject } from "@gooddata/gd-bear-model";
import { MEASUREGROUP } from "../constants/bucket";
import { executionObjectMock } from "./executionObjectMocks";
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

export const dataSourceWithTotals: DataLayer.DataSource.IDataSource<Execution.IExecutionResponses> = {
    getData: () => Promise.resolve(emptyExecutionResponse),
    getPage: () => Promise.resolve(emptyExecutionResponse),
    getAfm: () => executionObjectMock.withTotals.execution.afm,
    getFingerprint: () => JSON.stringify(executionObjectMock.withTotals.execution.afm),
};

export const dummyBaseChartResultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [MEASUREGROUP],
        },
        {
            itemIdentifiers: [],
        },
    ],
    sorts: [],
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

export const stackedBaseChartResultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: ["a2"],
        },
        {
            itemIdentifiers: ["a1", "measureGroup"],
        },
    ],
    sorts: [],
};

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

export const insightWithTwoViewBys: IInsight = {
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

export const mdObjectAttributeOnly: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
    },
    buckets: [
        {
            localIdentifier: BucketNames.ATTRIBUTE,
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "/gdc/md/project/obj/1027",
                        },
                    },
                },
            ],
        },
    ],
};

export const mdObjectWithTotals: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
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
            localIdentifier: BucketNames.ATTRIBUTE,
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "/gdc/md/project/obj/1027",
                        },
                    },
                },
            ],
            totals: [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                    alias: "Sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "avg",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ],
        },
    ],
};

export const singleMeasureMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
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
    ],
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

export const stackedMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
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
                    visualizationAttribute: {
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
                    visualizationAttribute: {
                        localIdentifier: "a2",
                        displayForm: {
                            uri: "/gdc/md/project/obj/1028",
                        },
                    },
                },
            ],
        },
    ],
};

export const twoViewItemsMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
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
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "/gdc/md/project/obj/1027",
                        },
                    },
                },
                {
                    visualizationAttribute: {
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
};

export const twoMeasuresMdObject: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/mockproject/obj/column",
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
                    visualizationAttribute: {
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
};

// Visualization classes
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
