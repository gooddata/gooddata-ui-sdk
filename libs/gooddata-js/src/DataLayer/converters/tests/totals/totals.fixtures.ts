// (C) 2007-2018 GoodData Corporation
import { AFM, VisualizationObject } from "@gooddata/typings";
import { IFixture } from "../fixtures/Afm.fixtures";

export const METRIC_ID_URI = "/gdc/md/project/obj/100";
export const METRIC_ID_URI_2 = "/gdc/md/project/obj/101";
export const ATTRIBUTE_DISPLAY_FORM_URI = "/gdc/md/project/obj/1";
export const ATTRIBUTE_DISPLAY_FORM_URI_2 = "/gdc/md/project/obj/2";

const afmAttributes: AFM.IAttribute[] = [
    {
        localIdentifier: "a1",
        displayForm: {
            uri: ATTRIBUTE_DISPLAY_FORM_URI,
        },
    },
    {
        localIdentifier: "a2",
        displayForm: {
            uri: ATTRIBUTE_DISPLAY_FORM_URI_2,
        },
    },
];

const afmMeasures: AFM.IMeasure[] = [
    {
        localIdentifier: "m1",
        alias: "SUM of Measure M1",
        definition: {
            measure: {
                aggregation: "sum",
                item: {
                    uri: METRIC_ID_URI,
                },
            },
        },
    },
    {
        localIdentifier: "m2",
        alias: "COUNT of Measure M2",
        definition: {
            measure: {
                aggregation: "count",
                item: {
                    uri: METRIC_ID_URI_2,
                },
            },
        },
        format: "#,##0",
    },
];

const afmNativeTotals: AFM.INativeTotalItem[] = [
    {
        measureIdentifier: "m1",
        attributeIdentifiers: [],
    },
    {
        measureIdentifier: "m2",
        attributeIdentifiers: [],
    },
];

const measureBucketItems: VisualizationObject.BucketItem[] = [
    {
        measure: {
            localIdentifier: "m1",
            alias: "SUM of Measure M1",
            definition: {
                measureDefinition: {
                    item: {
                        uri: METRIC_ID_URI,
                    },
                    aggregation: "sum",
                },
            },
        },
    },
    {
        measure: {
            localIdentifier: "m2",
            alias: "COUNT of Measure M2",
            definition: {
                measureDefinition: {
                    item: {
                        uri: METRIC_ID_URI_2,
                    },
                    aggregation: "count",
                },
            },
        },
    },
];

const attributeBucketItems: VisualizationObject.BucketItem[] = [
    {
        visualizationAttribute: {
            localIdentifier: "a1",
            displayForm: {
                uri: ATTRIBUTE_DISPLAY_FORM_URI,
            },
        },
    },
    {
        visualizationAttribute: {
            localIdentifier: "a2",
            displayForm: {
                uri: ATTRIBUTE_DISPLAY_FORM_URI_2,
            },
        },
    },
];

const totalsInBucket: VisualizationObject.IVisualizationTotal[] = [
    {
        measureIdentifier: "m1",
        type: "nat",
        attributeIdentifier: "a1",
    },
    {
        measureIdentifier: "m2",
        type: "nat",
        attributeIdentifier: "a1",
    },
];

export const executionWithoutTotals: IFixture = {
    afm: {
        attributes: afmAttributes,
        measures: afmMeasures,
    },
    resultSpec: {},
};

export const executionWithTotals: IFixture = {
    afm: {
        attributes: afmAttributes,
        measures: afmMeasures,
        nativeTotals: afmNativeTotals,
    },
    resultSpec: {},
};

export const tableWithoutTotals: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "visClassUri",
    },
    buckets: [
        {
            localIdentifier: "measures",
            items: measureBucketItems,
        },
        {
            localIdentifier: "attributes",
            items: attributeBucketItems,
        },
    ],
};

export const tableWithTotals: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "visClassUri",
    },
    buckets: [
        {
            localIdentifier: "measures",
            items: measureBucketItems,
            totals: totalsInBucket,
        },
        {
            localIdentifier: "attributes",
            items: attributeBucketItems,
        },
    ],
};
