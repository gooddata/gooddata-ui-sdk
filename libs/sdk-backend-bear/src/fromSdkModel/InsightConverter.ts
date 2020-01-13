// (C) 2019-2020 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IInsightDefinition,
    insightBuckets,
    insightVisualizationUrl,
    IBucket,
    AttributeOrMeasure,
    isMeasure,
    IAttribute,
    attributeLocalId,
    attributeAlias,
    attributeAttributeDisplayFormObjRef,
    insightTitle,
    insightFilters,
    insightProperties,
} from "@gooddata/sdk-model";
import { convertUrisToReferences } from "../toSdkModel/ReferenceConverter";
import { serializeProperties } from "../toSdkModel/PropertiesConverter";
import { convertExtendedFilter, shouldFilterBeIncluded } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";

const convertAttribute = (attribute: IAttribute): GdcVisualizationObject.IAttribute => {
    return {
        visualizationAttribute: {
            alias: attributeAlias(attribute),
            displayForm: attributeAttributeDisplayFormObjRef(attribute),
            localIdentifier: attributeLocalId(attribute),
        },
    };
};

const convertBucketItem = (bucketItem: AttributeOrMeasure): GdcVisualizationObject.BucketItem => {
    return isMeasure(bucketItem) ? convertMeasure(bucketItem) : convertAttribute(bucketItem);
};

const convertBucket = (bucket: IBucket): GdcVisualizationObject.IBucket => {
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        totals: bucket.totals,
    };
};

const convertInsightContent = (
    insight: IInsightDefinition,
): GdcVisualizationObject.IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    return {
        buckets: insightBuckets(insight).map(convertBucket),
        visualizationClass: {
            uri: insightVisualizationUrl(insight),
        },
        filters: insightFilters(insight)
            .filter(shouldFilterBeIncluded)
            .map(convertExtendedFilter),
        properties: serializeProperties(properties),
        references,
    };
};

export const convertInsight = (insight: IInsightDefinition): GdcVisualizationObject.IVisualizationObject => {
    return {
        content: convertInsightContent(insight),
        meta: {
            title: insightTitle(insight),
        },
    };
};
