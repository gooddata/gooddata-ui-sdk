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
    attributeShowAllValues,
    insightAttributeFilterConfigs,
    insightBuckets,
    insightCreated,
    insightFilters,
    insightId,
    insightIsHidden,
    insightIsLocked,
    insightLayers,
    insightParameters,
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
    type IVisualizationObject,
    type IVisualizationObjectAttribute,
    type IBucket as IVisualizationObjectBucket,
    type IVisualizationObjectContent,
} from "../../typings/bear/bearTypes.js";

import { convertExtendedFilter } from "./FilterConverter.js";
import { convertMeasure } from "./MeasureConverter.js";
import { serializeProperties } from "./PropertiesConverter.js";
import { convertUrisToReferences } from "./ReferenceConverter.js";

const convertAttribute = (attribute: IAttribute): IVisualizationObjectAttribute => {
    const alias = attributeAlias(attribute);
    const showAllValues = attributeShowAllValues(attribute);
    return {
        visualizationAttribute: {
            localIdentifier: attributeLocalId(attribute),
            displayForm: attributeDisplayFormRef(attribute),
            ...(alias && { alias }),
            ...(showAllValues && { showAllValues }),
        },
    };
};

const convertBucketItem = (
    bucketItem: IAttributeOrMeasure,
    autoGenerateFilterLocalIdentifier: boolean,
): BucketItem => {
    return isMeasure(bucketItem)
        ? convertMeasure(bucketItem, autoGenerateFilterLocalIdentifier)
        : convertAttribute(bucketItem);
};

const convertBucket = (
    bucket: IBucket,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectBucket => {
    const { totals } = bucket;
    return {
        items: bucket.items.map((item) => convertBucketItem(item, autoGenerateFilterLocalIdentifier)),
        localIdentifier: bucket.localIdentifier,
        ...(!isEmpty(totals) && { totals }),
    };
};

export const convertInsightContent = (
    insight: IInsightDefinition,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    const filters = compact(
        insightFilters(insight).map((filter) =>
            convertExtendedFilter(filter, autoGenerateFilterLocalIdentifier),
        ),
    );
    const attributeFilterConfigs = insightAttributeFilterConfigs(insight);

    const layers = insightLayers(insight);
    const parameters = insightParameters(insight);

    return {
        buckets: insightBuckets(insight).map((bucket) =>
            convertBucket(bucket, autoGenerateFilterLocalIdentifier),
        ),
        visualizationClass: { uri: insightVisualizationUrl(insight) },
        ...(!isEmpty(nonEmptyProperties) && {
            properties: serializeProperties(nonEmptyProperties),
        }),
        ...(!isEmpty(filters) && { filters }),
        ...(!isEmpty(attributeFilterConfigs) && { attributeFilterConfigs }),
        ...(!isEmpty(references) && { references }),
        ...(!isEmpty(layers) && { layers }),
        ...(!isEmpty(parameters) && { parameters }),
    };
};

export const convertInsightDefinition = (
    insight: IInsightDefinition,
    autoGenerateFilterLocalIdentifier: boolean,
): IVisualizationObject => {
    return {
        content: convertInsightContent(insight, autoGenerateFilterLocalIdentifier),
        meta: {
            title: insightTitle(insight),
            tags: insightTags(insight),
            summary: insightSummary(insight),
            category: "visualizationObject",
        },
    } as IVisualizationObject;
};

export const convertModelInsightToADRep = (
    insight: IInsight,
    autoGenerateFilterLocalIdentifier = false,
): IVisualizationObject => {
    const convertedDefinition = convertInsightDefinition(insight, autoGenerateFilterLocalIdentifier);
    const locked = insightIsLocked(insight);
    const isHidden = insightIsHidden(insight);
    const { permissions } = insight.insight;

    return {
        content: convertedDefinition.content,
        meta: {
            ...convertedDefinition.meta,
            identifier: insightId(insight),
            uri: insightUri(insight),
            created: insightCreated(insight),
            updated: insightUpdated(insight),
            ...(locked && { locked }),
            ...(permissions && { permissions }),
            ...(isHidden && { isHidden }),
        },
    };
};
