// (C) 2019-2022 GoodData Corporation
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
    DateAttributeGranularity,
    IRankingFilter,
    IMeasureValueFilter,
    uriRef,
    IUser,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import omit from "lodash/omit.js";
import { GdcMetadata, GdcVisualizationObject } from "@gooddata/api-model-bear";
import { convertReferencesToUris } from "./ReferenceConverter.js";
import { deserializeProperties, serializeProperties } from "./PropertiesConverter.js";
import { fromBearRef, fromScopedBearRef } from "./ObjRefConverter.js";

// we use more lenient uri "detection" here because the one in bear-client makes some legacy data fail
// as the objId is not always just a number
const isUriLike = (value: string): boolean => /\/gdc\/md\/\S+\/obj\/\S+/.test(value);

const convertAttributeElements = (items: string[]): IAttributeElements => {
    if (!items.length) {
        // in case of empty filter assume that it is meant to be an URI-based one as these are much more common on bear
        return { uris: [] };
    }
    // we assume that all the items either use uris, or values, not both, since there is no way of representing the mixed variant
    const first = items[0];
    return isUriLike(first) ? { uris: items } : { values: items };
};

const convertMeasureValueFilter = (
    filter: GdcVisualizationObject.IMeasureValueFilter,
): IMeasureValueFilter => {
    return {
        measureValueFilter: {
            condition: filter.measureValueFilter.condition,
            measure: fromScopedBearRef(filter.measureValueFilter.measure, "measure"),
        },
    };
};

const convertRankingFilter = (filter: GdcVisualizationObject.IRankingFilter): IRankingFilter => {
    const { measures, operator, value, attributes } = filter.rankingFilter;
    return {
        rankingFilter: {
            measure: fromScopedBearRef(measures[0], "measure"),
            operator,
            value,
            attributes,
        },
    };
};

const convertFilter = (filter: GdcVisualizationObject.ExtendedFilter): IFilter => {
    if (GdcVisualizationObject.isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (GdcVisualizationObject.isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else {
        return convertMeasureFilter(filter);
    }
};

const convertMeasureFilter = (filter: GdcVisualizationObject.Filter): IMeasureFilter => {
    if (GdcVisualizationObject.isAttributeFilter(filter)) {
        if (GdcVisualizationObject.isPositiveAttributeFilter(filter)) {
            return {
                positiveAttributeFilter: {
                    displayForm: fromBearRef(filter.positiveAttributeFilter.displayForm, "displayForm"),
                    in: convertAttributeElements(filter.positiveAttributeFilter.in),
                },
            };
        }
        return {
            negativeAttributeFilter: {
                displayForm: fromBearRef(filter.negativeAttributeFilter.displayForm, "displayForm"),
                notIn: convertAttributeElements(filter.negativeAttributeFilter.notIn),
            },
        };
    } else {
        if (GdcVisualizationObject.isAbsoluteDateFilter(filter)) {
            return {
                absoluteDateFilter: {
                    dataSet: fromBearRef(filter.absoluteDateFilter.dataSet, "dataSet"),
                    from: filter.absoluteDateFilter.from || "", // TODO can we really do this (should we?)
                    to: filter.absoluteDateFilter.to || "",
                },
            };
        }

        // check for all-time filters with missing bounds (even one missing bound suggests an all time filter)
        // we cannot remove them, as they do make sense in some rare legacy contexts
        if (isNil(filter.relativeDateFilter.from) || isNil(filter.relativeDateFilter.to)) {
            console.warn(
                "RelativeDateFilter without 'from' or 'to' field encountered." +
                    "This can make sense in some legacy contexts (e.g. PoP measures with All time global filter), but generally, this indicates an error." +
                    "Please check the visualization object data to make sure the relativeDateFilter data is what you expected.",
            );
        }

        return {
            relativeDateFilter: {
                ...filter.relativeDateFilter,
                granularity: filter.relativeDateFilter.granularity as DateAttributeGranularity,
                from: filter.relativeDateFilter.from!,
                to: filter.relativeDateFilter.to!,
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
    return {
        attribute: {
            ...attribute.visualizationAttribute,
            displayForm: fromBearRef(attribute.visualizationAttribute.displayForm, "displayForm"),
        },
    };
};

const convertBucketItem = (bucketItem: GdcVisualizationObject.BucketItem): IAttributeOrMeasure => {
    return GdcVisualizationObject.isMeasure(bucketItem)
        ? convertMeasure(bucketItem)
        : convertAttribute(bucketItem);
};

export const convertBucket = (bucket: GdcVisualizationObject.IBucket): IBucket => {
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

/**
 *
 * @internal
 */
export const convertVisualization = (
    visualization: GdcVisualizationObject.IVisualization,
    visualizationClassUri: string,
    userMap?: Map<string, IUser>,
): IInsight => {
    const withResolvedReferences = resolveReferences(visualization.visualizationObject);
    const { content, meta } = withResolvedReferences;
    const parsedProperties = deserializeProperties(content.properties);

    return {
        insight: {
            buckets: content.buckets.map(convertBucket),
            filters: content.filters ? compact(content.filters.map(convertFilter)) : [],
            ref: uriRef(meta.uri!),
            // we assume that identifier is always defined for visualizations
            identifier: meta.identifier!,
            properties: parsedProperties,
            sorts: parsedProperties.sortItems || [],
            title: meta.title,
            uri: meta.uri!,
            visualizationUrl: visualizationClassUri,
            created: meta.created,
            createdBy: meta.author ? userMap?.get(meta.author) : undefined,
            updated: meta.updated,
            updatedBy: meta.contributor ? userMap?.get(meta.contributor) : undefined,
            isLocked: meta.locked,
            tags: meta.tags?.split(" ").filter(Boolean) ?? [],
            summary: meta.summary ?? "",
        },
    };
};

export const convertListedVisualization = (visualizationLink: GdcMetadata.IObjectLink): IInsight => {
    const ref = uriRef(visualizationLink.link);

    return {
        insight: {
            identifier: visualizationLink.identifier || "",
            title: visualizationLink.title || "",
            uri: visualizationLink.link,
            ref: ref,
            properties: [],
            sorts: [],
            visualizationUrl: "",
            buckets: [],
            filters: [],
            tags: [],
            created: visualizationLink.created,
            updated: visualizationLink.updated,
            summary: visualizationLink.summary,
        },
    };
};
