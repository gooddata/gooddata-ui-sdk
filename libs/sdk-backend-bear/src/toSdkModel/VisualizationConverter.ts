// (C) 2019 GoodData Corporation
import {
    IInsight,
    IBucket,
    AttributeOrMeasure,
    IMeasure,
    IMeasureDefinitionType,
    IFilter,
    AttributeElements,
    IAttribute,
    IMeasureFilter,
} from "@gooddata/sdk-model";
import isEmpty = require("lodash/isEmpty");
import omit = require("lodash/omit");
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import { convertReferencesToUris } from "./ReferenceConverter";
import { deserializeProperties, serializeProperties } from "./PropertiesConverter";
import { isUri } from "@gooddata/gd-bear-client";

const convertAttributeElements = (items: string[]): AttributeElements => {
    if (!items.length) {
        return { values: [] }; // TODO is this OK or we want to throw?
    }
    // we assume that all the items either use uris, or values, not both, since there no way of representing the mixed variant
    const first = items[0];
    return isUri(first) ? { uris: items } : { values: items };
};

const convertFilter = (filter: GdcVisualizationObject.ExtendedFilter): IFilter => {
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

const convertMeasureFilter = (filter: GdcVisualizationObject.Filter): IMeasureFilter => {
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
        return {
            relativeDateFilter: {
                ...filter.relativeDateFilter,
                from: filter.relativeDateFilter.from || 0, // TODO can we really do this (should we?)
                to: filter.relativeDateFilter.to || 0,
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
            filters: filters ? filters.map(convertMeasureFilter) : [],
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

const convertBucketItem = (bucketItem: GdcVisualizationObject.BucketItem): AttributeOrMeasure => {
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
            filters: content.filters ? content.filters.map(convertFilter) : [],
            identifier: meta.identifier!, // we assume that identifier is always defined for visualizations
            properties: { properties: parsedProperties },
            sorts: parsedProperties.sortItems || [],
            title: meta.title!,
            uri: meta.uri,
            visualizationClassUri,
        },
    };
};
