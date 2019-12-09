// (C) 2019 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IInsightWithoutIdentifier,
    insightBuckets,
    insightVisualizationClassIdentifier,
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
    insight: IInsightWithoutIdentifier,
): GdcVisualizationObject.IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    return {
        buckets: insightBuckets(insight).map(convertBucket),
        visualizationClass: {
            uri: insightVisualizationClassIdentifier(insight), // TODO this might not be an uri but an identifier...
        },
        filters: insightFilters(insight)
            .filter(shouldFilterBeIncluded)
            .map(convertExtendedFilter),
        properties: serializeProperties(properties),
        references,
    };
};

export const convertInsight = (
    insight: IInsightWithoutIdentifier,
): GdcVisualizationObject.IVisualizationObject => {
    return {
        content: convertInsightContent(insight),
        meta: {
            title: insightTitle(insight),
        },
    };
};
