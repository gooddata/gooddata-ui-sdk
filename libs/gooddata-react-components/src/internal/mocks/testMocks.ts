// (C) 2019 GoodData Corporation
import { DataLayer } from "@gooddata/gooddata-js";
import { Execution, VisualizationObject, AFM, VisualizationClass } from "@gooddata/typings";
import { MEASUREGROUP } from "../constants/bucket";
import { executionObjectMock } from "./executionObjectMocks";
import * as BucketNames from "../../constants/bucketNames";

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
export const dummyTableVisualizationClass: VisualizationClass.IVisualizationClass = {
    meta: {
        title: EMPTY_TITLE,
    },
    content: {
        url: "local:table",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};

export const dummyColumnVisualizationClass: VisualizationClass.IVisualizationClass = {
    meta: {
        title: EMPTY_TITLE,
    },
    content: {
        url: "local:column",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};

export const dummyHeadlineVisualizationClass: VisualizationClass.IVisualizationClass = {
    meta: {
        title: EMPTY_TITLE,
    },
    content: {
        url: "local:headline",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};

export const dummyUnknownTypeVisualizationClass: VisualizationClass.IVisualizationClass = {
    meta: {
        title: EMPTY_TITLE,
    },
    content: {
        url: "unknown",
        icon: "",
        iconSelected: "",
        checksum: "",
    },
};
