// (C) 2019-2022 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/api-model-bear";
import {
    IInsightDefinition,
    insightBuckets,
    insightVisualizationUrl,
    IBucket,
    IAttributeOrMeasure,
    isMeasure,
    IAttribute,
    attributeLocalId,
    attributeAlias,
    attributeDisplayFormRef,
    insightTitle,
    insightFilters,
    insightProperties,
    insightId,
    insightUri,
    insightIsLocked,
    IInsight,
    insightCreated,
    insightUpdated,
    insightTags,
    insightSummary,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import omitBy from "lodash/omitBy.js";
import { convertUrisToReferences } from "../fromBackend/ReferenceConverter.js";
import { serializeProperties } from "../fromBackend/PropertiesConverter.js";
import { convertExtendedFilter } from "./FilterConverter.js";
import { convertMeasure } from "./MeasureConverter.js";

const convertAttribute = (attribute: IAttribute): GdcVisualizationObject.IAttribute => {
    const alias = attributeAlias(attribute);

    return {
        visualizationAttribute: {
            localIdentifier: attributeLocalId(attribute),
            displayForm: attributeDisplayFormRef(attribute),
            ...(alias && { alias }),
        },
    };
};

const convertBucketItem = (bucketItem: IAttributeOrMeasure): GdcVisualizationObject.BucketItem => {
    return isMeasure(bucketItem) ? convertMeasure(bucketItem) : convertAttribute(bucketItem);
};

const convertBucket = (bucket: IBucket): GdcVisualizationObject.IBucket => {
    const { totals } = bucket;
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        ...(!isEmpty(totals) && { totals }),
    };
};

/**
 * @internal
 */
export const convertInsightContent = (
    insight: IInsightDefinition,
): GdcVisualizationObject.IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    const filters = insightFilters(insight).map(convertExtendedFilter);

    return {
        buckets: insightBuckets(insight).map(convertBucket),
        visualizationClass: { uri: insightVisualizationUrl(insight) },
        ...(!isEmpty(nonEmptyProperties) && {
            properties: serializeProperties(nonEmptyProperties),
        }),
        ...(!isEmpty(filters) && { filters }),
        ...(!isEmpty(references) && { references }),
    };
};

/**
 * @internal
 */
export const convertInsightDefinition = (
    insight: IInsightDefinition,
): GdcVisualizationObject.IVisualizationObject => {
    return {
        content: convertInsightContent(insight),
        meta: {
            title: insightTitle(insight),
            category: "visualizationObject",
            summary: insightSummary(insight),
        },
    } as GdcVisualizationObject.IVisualizationObject;
};

/**
 * @internal
 */
export const convertInsight = (insight: IInsight): GdcVisualizationObject.IVisualizationObject => {
    const convertedDefinition = convertInsightDefinition(insight);
    const locked = insightIsLocked(insight);

    return {
        content: convertedDefinition.content,
        meta: {
            ...convertedDefinition.meta,
            identifier: insightId(insight),
            uri: insightUri(insight),
            created: insightCreated(insight),
            updated: insightUpdated(insight),
            ...(locked && { locked }),
            tags: insightTags(insight).join(" "),
        },
    };
};
