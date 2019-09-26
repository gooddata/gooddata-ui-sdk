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
} from "@gooddata/sdk-model";
import { VisualizationObject } from "@gooddata/gd-bear-model";

const REG_URI_OBJ = /\/gdc\/md\/(\S+)\/obj\/\d+/;
const isUri = (identifier: string) => REG_URI_OBJ.test(identifier);

const convertAttributeElements = (items: string[]): AttributeElements => {
    if (!items.length) {
        return { values: [] }; // TODO is this OK or we want to throw?
    }
    const first = items[0];
    return isUri(first) ? { uris: items } : { values: items };
};

const convertFilter = (filter: VisualizationObject.VisualizationObjectFilter): IFilter => {
    if (VisualizationObject.isAttributeFilter(filter)) {
        if (VisualizationObject.isPositiveAttributeFilter(filter)) {
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
        if (VisualizationObject.isAbsoluteDateFilter(filter)) {
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
    definition: VisualizationObject.IMeasureDefinitionType,
): IMeasureDefinitionType => {
    if (VisualizationObject.isArithmeticMeasureDefinition(definition)) {
        return definition;
    }
    if (VisualizationObject.isPopMeasureDefinition(definition)) {
        return definition;
    }
    if (VisualizationObject.isPreviousPeriodMeasureDefinition(definition)) {
        return definition;
    }
    const { filters } = definition.measureDefinition;
    return {
        measureDefinition: {
            ...definition.measureDefinition,
            filters: filters ? filters.map(convertFilter) : [],
        },
    };
};

const convertMeasure = (measure: VisualizationObject.IMeasure): IMeasure => {
    const { definition } = measure.measure;

    return {
        measure: {
            ...measure.measure,
            definition: convertMeasureDefinition(definition),
        },
    };
};

const convertAttribute = (attribute: VisualizationObject.IVisualizationAttribute): IAttribute => {
    return { attribute: attribute.visualizationAttribute };
};

const convertBucketItem = (bucketItem: VisualizationObject.BucketItem): AttributeOrMeasure => {
    return VisualizationObject.isMeasure(bucketItem)
        ? convertMeasure(bucketItem)
        : convertAttribute(bucketItem);
};

const convertBucket = (bucket: VisualizationObject.IBucket): IBucket => {
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        totals: bucket.totals,
    };
};

export const convertVisualization = (
    visualization: VisualizationObject.IVisualization,
    visualizationClassIdentifier: string,
): IInsight => {
    const { content, meta } = visualization.visualizationObject;
    return {
        insight: {
            buckets: content.buckets.map(convertBucket),
            filters: content.filters ? content.filters.map(convertFilter) : [],
            identifier: meta.identifier!, // TODO can identifier really be undefined?
            properties: {}, // TODO
            sorts: [], // TODO
            title: meta.title,
            uri: meta.uri,
            visualizationClassIdentifier,
        },
    };
};
