// (C) 2019-2020 GoodData Corporation
import {
    IInsight,
    IBucket,
    IAttributeOrMeasure,
    IMeasure,
    IMeasureDefinitionType,
    IFilter,
    IAttributeElements,
    IAttribute,
    IMeasureFilter,
} from "@gooddata/sdk-model";
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import isNil = require("lodash/isNil");
import omit = require("lodash/omit");
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import { convertReferencesToUris } from "./ReferenceConverter";
import { deserializeProperties, serializeProperties } from "./PropertiesConverter";

// we use more lenient uri "detection" here because the one in bear-client makes some legacy data fail
// as the objId is not always just a number
const isUriLike = (value: string): boolean => /\/gdc\/md\/\S+\/obj\/\S+/.test(value);

const convertAttributeElements = (items: string[]): IAttributeElements => {
    if (!items.length) {
        return { values: [] }; // TODO is this OK or we want to throw?
    }
    // we assume that all the items either use uris, or values, not both, since there is no way of representing the mixed variant
    const first = items[0];
    return isUriLike(first) ? { uris: items } : { values: items };
};

const convertFilter = (filter: GdcVisualizationObject.ExtendedFilter): IFilter | null => {
    if (GdcVisualizationObject.isMeasureValueFilter(filter)) {
        return {
            measureValueFilter: {
                condition: filter.measureValueFilter.condition,
                measure: filter.measureValueFilter.measure,
            },
        };
    }

    return convertMeasureFilter(filter);
};

const convertMeasureFilter = (filter: GdcVisualizationObject.Filter): IMeasureFilter | null => {
    if (GdcVisualizationObject.isAttributeFilter(filter)) {
        if (GdcVisualizationObject.isPositiveAttributeFilter(filter)) {
            return {
                positiveAttributeFilter: {
                    displayForm: filter.positiveAttributeFilter.displayForm,
                    in: convertAttributeElements(filter.positiveAttributeFilter.in),
                },
            };
        }
        return {
            negativeAttributeFilter: {
                displayForm: filter.negativeAttributeFilter.displayForm,
                notIn: convertAttributeElements(filter.negativeAttributeFilter.notIn),
            },
        };
    } else {
        if (GdcVisualizationObject.isAbsoluteDateFilter(filter)) {
            return {
                absoluteDateFilter: {
                    dataSet: filter.absoluteDateFilter.dataSet,
                    from: filter.absoluteDateFilter.from || "", // TODO can we really do this (should we?)
                    to: filter.absoluteDateFilter.to || "",
                },
            };
        }

        // check for all-time filters with missing bounds (even one missing bound suggests an all time filter)
        if (isNil(filter.relativeDateFilter.from) || isNil(filter.relativeDateFilter.to)) {
            return null;
        }

        return {
            relativeDateFilter: {
                ...filter.relativeDateFilter,
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
            },
        };
    }
};

const convertMeasureDefinition = (
    definition: GdcVisualizationObject.IMeasureDefinitionType,
): IMeasureDefinitionType => {
    if (GdcVisualizationObject.isArithmeticMeasureDefinition(definition)) {
        return definition;
    }
    if (GdcVisualizationObject.isPopMeasureDefinition(definition)) {
        return definition;
    }
    if (GdcVisualizationObject.isPreviousPeriodMeasureDefinition(definition)) {
        return definition;
    }
    const { filters } = definition.measureDefinition;
    return {
        measureDefinition: {
            ...definition.measureDefinition,
            filters: filters ? compact(filters.map(convertMeasureFilter)) : [],
        },
    };
};

const convertMeasure = (measure: GdcVisualizationObject.IMeasure): IMeasure => {
    const { definition } = measure.measure;

    return {
        measure: {
            ...measure.measure,
            definition: convertMeasureDefinition(definition),
        },
    };
};

const convertAttribute = (attribute: GdcVisualizationObject.IAttribute): IAttribute => {
    return { attribute: attribute.visualizationAttribute };
};

const convertBucketItem = (bucketItem: GdcVisualizationObject.BucketItem): IAttributeOrMeasure => {
    return GdcVisualizationObject.isMeasure(bucketItem)
        ? convertMeasure(bucketItem)
        : convertAttribute(bucketItem);
};

const convertBucket = (bucket: GdcVisualizationObject.IBucket): IBucket => {
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        totals: bucket.totals,
    };
};

const resolveReferences = (
    mdObject: GdcVisualizationObject.IVisualizationObject,
): GdcVisualizationObject.IVisualizationObject => {
    const { content } = mdObject;
    if (!content) {
        return mdObject;
    }

    const { properties } = content;
    if (!properties) {
        return mdObject;
    }

    const { properties: convertedProperties, references: convertedReferences } = convertReferencesToUris({
        properties: deserializeProperties(properties),
        references: content.references || {},
    });

    // set the new properties and references
    const referencesProp = isEmpty(convertedReferences) ? undefined : { references: convertedReferences };

    return {
        ...mdObject,
        content: {
            ...(omit(mdObject.content, "references") as GdcVisualizationObject.IVisualizationObjectContent),
            properties: serializeProperties(convertedProperties),
            ...referencesProp,
        },
    };
};

export const convertVisualization = (
    visualization: GdcVisualizationObject.IVisualization,
    visualizationClassUri: string,
): IInsight => {
    const withResolvedReferences = resolveReferences(visualization.visualizationObject);
    const { content, meta } = withResolvedReferences;
    const parsedProperties = deserializeProperties(content.properties);

    return {
        insight: {
            buckets: content.buckets.map(convertBucket),
            filters: content.filters ? compact(content.filters.map(convertFilter)) : [],
            // we assume that identifier is always defined for visualizations
            identifier: meta.identifier!,
            // TODO: remove the need to have properties content wrapper in yet another 'properties' object
            properties: { properties: parsedProperties },
            sorts: parsedProperties.sortItems || [],
            title: meta.title!,
            uri: meta.uri!,
            visualizationUrl: visualizationClassUri,
            updated: meta.updated,
            isLocked: meta.locked,
        },
    };
};
