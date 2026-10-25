// (C) 2019-2026 GoodData Corporation

import { compact, isEmpty, omitBy } from "lodash-es";

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type IInsight,
    type IInsightDefinition,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    insightAttributeFilterConfigs,
    insightBuckets,
    insightCreated,
    insightFilters,
    insightId,
    insightIsLocked,
    insightLayers,
    insightProperties,
    insightSummary,
    insightTags,
    insightTitle,
    insightUpdated,
    insightUri,
    insightVisualizationUrl,
    isMeasure,
} from "@gooddata/sdk-model";

import {
    type BucketItem,
    type IBucket as IBearBucket,
    type IVisualizationObject,
    type IVisualizationObjectAttribute,
    type IVisualizationObjectContent,
} from "../../typings/bear/bearTypes.js";
import { serializeProperties } from "../fromBackend/PropertiesConverter.js";
import { convertUrisToReferences } from "../fromBackend/ReferenceConverter.js";

import { type IConvertInsightOptions, convertExtendedFilter } from "./FilterConverter.js";
import { convertMeasure } from "./MeasureConverter.js";

const convertAttribute = (attribute: IAttribute): IVisualizationObjectAttribute => {
    const alias = attributeAlias(attribute);

    return {
        visualizationAttribute: {
            localIdentifier: attributeLocalId(attribute),
            displayForm: attributeDisplayFormRef(attribute),
            ...(alias && { alias }),
        },
    };
};

const convertBucketItem = (bucketItem: IAttributeOrMeasure, options?: IConvertInsightOptions): BucketItem => {
    return isMeasure(bucketItem) ? convertMeasure(bucketItem, options) : convertAttribute(bucketItem);
};

const convertBucket = (bucket: IBucket, options?: IConvertInsightOptions): IBearBucket => {
    const { totals } = bucket;
    return {
        items: bucket.items.map((item) => convertBucketItem(item, options)),
        localIdentifier: bucket.localIdentifier,
        ...(!isEmpty(totals) && { totals }),
    };
};

/**
 * @internal
 */
export const convertInsightContent = (
    insight: IInsightDefinition,
    options?: IConvertInsightOptions,
): IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    const filters = compact(insightFilters(insight).map((filter) => convertExtendedFilter(filter, options)));
    const attributeFilterConfigs = insightAttributeFilterConfigs(insight);

    const layers = insightLayers(insight);

    return {
        buckets: insightBuckets(insight).map((bucket) => convertBucket(bucket, options)),
        visualizationClass: { uri: insightVisualizationUrl(insight) },
        ...(!isEmpty(nonEmptyProperties) && {
            properties: serializeProperties(nonEmptyProperties),
        }),
        ...(!isEmpty(filters) && { filters }),
        ...(!isEmpty(attributeFilterConfigs) && { attributeFilterConfigs }),
        ...(!isEmpty(references) && { references }),
        ...(!isEmpty(layers) && { layers }),
    };
};

/**
 * @internal
 */
export const convertInsightDefinition = (
    insight: IInsightDefinition,
    options?: IConvertInsightOptions,
): IVisualizationObject => {
    return {
        content: convertInsightContent(insight, options),
        meta: {
            title: insightTitle(insight),
            category: "visualizationObject",
            summary: insightSummary(insight),
        },
    } as IVisualizationObject;
};

/**
 * @internal
 */
export const convertInsight = (insight: IInsight, options?: IConvertInsightOptions): IVisualizationObject => {
    const convertedDefinition = convertInsightDefinition(insight, options);
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
            tags: insightTags(insight),
        },
    };
};
