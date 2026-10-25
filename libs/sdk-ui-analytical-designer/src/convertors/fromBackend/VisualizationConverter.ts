// (C) 2019-2026 GoodData Corporation

import { compact, isEmpty, omit } from "lodash-es";

import {
    type DateAttributeGranularity,
    type IArbitraryAttributeFilter,
    type IAttribute,
    type IAttributeElements,
    type IAttributeOrMeasure,
    type IBucket,
    type IFilter,
    type IInsight,
    type IMatchAttributeFilter,
    type IMeasure,
    type IMeasureDefinitionType,
    type IMeasureFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type IUser,
    type ObjectType,
    isComputedAttributeRef,
    uriRef,
} from "@gooddata/sdk-model";

import {
    type BucketItem,
    type IBucket as IBearBucket,
    type IVisualization,
    type IVisualizationObject,
    type IVisualizationObjectArbitraryAttributeFilter,
    type IVisualizationObjectAttribute,
    type IVisualizationObjectContent,
    type IVisualizationObjectMatchAttributeFilter,
    type IVisualizationObjectMeasure,
    type IVisualizationObjectMeasureValueFilter,
    type IVisualizationObjectRankingFilter,
    type Qualifier,
    type VisualizationObjectExtendedFilter,
    type VisualizationObjectFilter,
    type VisualizationObjectMeasureDefinitionType,
    isVisualizationObjectAbsoluteDateFilter,
    isVisualizationObjectArbitraryAttributeFilter,
    isVisualizationObjectArithmeticMeasureDefinition,
    isVisualizationObjectAttributeFilter,
    isVisualizationObjectMatchAttributeFilter,
    isVisualizationObjectMeasure,
    isVisualizationObjectMeasureValueFilter,
    isVisualizationObjectNegativeAttributeFilter,
    isVisualizationObjectPoPMeasureDefinition,
    isVisualizationObjectPositiveAttributeFilter,
    isVisualizationObjectPreviousPeriodMeasureDefinition,
    isVisualizationObjectRankingFilter,
    isVisualizationObjectRelativeDateFilter,
} from "../../typings/bear/bearTypes.js";

import { fromBearRef, fromScopedBearRef } from "./ObjRefConverter.js";
import { deserializeProperties, serializeProperties } from "./PropertiesConverter.js";
import { convertReferencesToUris } from "./ReferenceConverter.js";

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

const convertArbitraryAttributeFilter = (
    filter: IVisualizationObjectArbitraryAttributeFilter,
): IArbitraryAttributeFilter => ({
    arbitraryAttributeFilter: {
        ...(filter.arbitraryAttributeFilter.localIdentifier === undefined
            ? {}
            : { localIdentifier: filter.arbitraryAttributeFilter.localIdentifier }),
        label: fromBearRef(
            filter.arbitraryAttributeFilter.displayForm,
            computedAttributeDefaultType(filter.arbitraryAttributeFilter.displayForm),
        ),
        values: filter.arbitraryAttributeFilter.values,
        negativeSelection: filter.arbitraryAttributeFilter.negativeSelection,
    },
});

const convertMatchAttributeFilter = (
    filter: IVisualizationObjectMatchAttributeFilter,
): IMatchAttributeFilter => ({
    matchAttributeFilter: {
        ...(filter.matchAttributeFilter.localIdentifier === undefined
            ? {}
            : { localIdentifier: filter.matchAttributeFilter.localIdentifier }),
        label: fromBearRef(
            filter.matchAttributeFilter.displayForm,
            computedAttributeDefaultType(filter.matchAttributeFilter.displayForm),
        ),
        operator: filter.matchAttributeFilter.operator,
        literal: filter.matchAttributeFilter.literal,
        ...(filter.matchAttributeFilter.caseSensitive === undefined
            ? {}
            : { caseSensitive: filter.matchAttributeFilter.caseSensitive }),
        ...(filter.matchAttributeFilter.negativeSelection === undefined
            ? {}
            : {
                  negativeSelection: filter.matchAttributeFilter.negativeSelection,
              }),
    },
});

const convertMeasureValueFilter = (filter: IVisualizationObjectMeasureValueFilter): IMeasureValueFilter => {
    const dimensionalityProp = filter.measureValueFilter.dimensionality?.length
        ? {
              dimensionality: filter.measureValueFilter.dimensionality.map((item) =>
                  fromScopedBearRef(item, computedAttributeDefaultType(item)),
              ),
          }
        : {};

    const { conditions: conditionsFromMd, condition, applyOnResult } = filter.measureValueFilter;
    let conditions = undefined;
    if (conditionsFromMd?.length) {
        conditions = conditionsFromMd;
    } else if (condition) {
        conditions = [condition];
    }

    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    return {
        measureValueFilter: {
            ...(conditions?.length === 1 ? { condition: conditions[0] } : {}),
            ...(conditions && conditions.length > 1 ? { conditions } : {}),
            measure: fromScopedBearRef(filter.measureValueFilter.measure, "measure"),
            ...dimensionalityProp,
            ...applyOnResultProp,
        },
    };
};

const convertRankingFilter = (filter: IVisualizationObjectRankingFilter): IRankingFilter => {
    const { measures, operator, value, attributes, applyOnResult, strictLimitOfRows } = filter.rankingFilter;
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    return {
        rankingFilter: {
            measure: fromScopedBearRef(measures[0], "measure"),
            operator,
            value,
            attributes,
            ...strictLimitOfRowsProp,
            ...applyOnResultProp,
        },
    };
};

export const convertFilter = (filter: VisualizationObjectExtendedFilter): IFilter => {
    if (isVisualizationObjectMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isVisualizationObjectRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else if (isVisualizationObjectArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter);
    } else if (isVisualizationObjectMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter);
    } else if (isVisualizationObjectAttributeFilter(filter)) {
        return convertMeasureFilter(filter);
    } else if (isVisualizationObjectAbsoluteDateFilter(filter)) {
        return convertMeasureFilter(filter);
    } else if (isVisualizationObjectRelativeDateFilter(filter)) {
        return convertMeasureFilter(filter);
    }
    throw new Error("Unsupported visualization filter type");
};

const convertMeasureFilter = (filter: VisualizationObjectFilter): IMeasureFilter => {
    if (isVisualizationObjectArbitraryAttributeFilter(filter)) {
        return convertArbitraryAttributeFilter(filter);
    } else if (isVisualizationObjectMatchAttributeFilter(filter)) {
        return convertMatchAttributeFilter(filter);
    }
    if (isVisualizationObjectAttributeFilter(filter)) {
        if (isVisualizationObjectPositiveAttributeFilter(filter)) {
            return {
                positiveAttributeFilter: {
                    localIdentifier: filter.positiveAttributeFilter.localIdentifier,
                    displayForm: fromBearRef(
                        filter.positiveAttributeFilter.displayForm,
                        computedAttributeDefaultType(filter.positiveAttributeFilter.displayForm),
                    ),
                    in: convertAttributeElements(filter.positiveAttributeFilter.in),
                },
            };
        } else if (isVisualizationObjectNegativeAttributeFilter(filter)) {
            return {
                negativeAttributeFilter: {
                    localIdentifier: filter.negativeAttributeFilter.localIdentifier,
                    displayForm: fromBearRef(
                        filter.negativeAttributeFilter.displayForm,
                        computedAttributeDefaultType(filter.negativeAttributeFilter.displayForm),
                    ),
                    notIn: convertAttributeElements(filter.negativeAttributeFilter.notIn),
                },
            };
        }
    } else if (isVisualizationObjectAbsoluteDateFilter(filter)) {
        const { emptyValueHandling } = filter.absoluteDateFilter;
        return {
            absoluteDateFilter: {
                dataSet: fromBearRef(filter.absoluteDateFilter.dataSet, "dataSet"),
                from: filter.absoluteDateFilter.from || "", // TODO can we really do this (should we?)
                to: filter.absoluteDateFilter.to || "",
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        };
    } else if (isVisualizationObjectRelativeDateFilter(filter)) {
        // check for all-time filters with missing bounds (even one missing bound suggests an all time filter)
        // we cannot remove them, as they do make sense in some rare legacy contexts
        if (
            filter.relativeDateFilter.from === null ||
            filter.relativeDateFilter.from === undefined ||
            filter.relativeDateFilter.to === null ||
            filter.relativeDateFilter.to === undefined
        ) {
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
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
            },
        };
    }
    throw new Error("Unsupported measure filter type");
};

const convertMeasureDefinition = (
    definition: VisualizationObjectMeasureDefinitionType,
): IMeasureDefinitionType => {
    if (isVisualizationObjectArithmeticMeasureDefinition(definition)) {
        return definition;
    }
    if (isVisualizationObjectPoPMeasureDefinition(definition)) {
        return definition;
    }
    if (isVisualizationObjectPreviousPeriodMeasureDefinition(definition)) {
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

const convertMeasure = (measure: IVisualizationObjectMeasure): IMeasure => {
    const { definition } = measure.measure;

    return {
        measure: {
            ...measure.measure,
            definition: convertMeasureDefinition(definition),
        },
    };
};

const convertAttribute = (attribute: IVisualizationObjectAttribute): IAttribute => {
    const displayForm = attribute.visualizationAttribute.displayForm;

    return {
        attribute: {
            ...attribute.visualizationAttribute,
            displayForm: fromBearRef(displayForm, computedAttributeDefaultType(displayForm)),
        },
    };
};

/**
 * A computed attribute's fabricated display form can't be re-derived from where the ref sits (a
 * bucket item, an attribute filter or a measure value filter dimensionality), so its type has to
 * ride along on the ref itself through the bear-shaped MD object the editor builds. Everything else
 * defaults to a plain display form.
 */
function computedAttributeDefaultType(ref: Qualifier): ObjectType {
    return isComputedAttributeRef(ref) ? "computedAttribute" : "displayForm";
}

const convertBucketItem = (bucketItem: BucketItem): IAttributeOrMeasure => {
    return isVisualizationObjectMeasure(bucketItem)
        ? convertMeasure(bucketItem)
        : convertAttribute(bucketItem);
};

/**
 * @internal
 */
export const convertBucket = (bucket: IBearBucket): IBucket => {
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        totals: bucket.totals,
    };
};

const resolveReferences = (mdObject: IVisualizationObject): IVisualizationObject => {
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
            ...(omit(mdObject.content, "references") as IVisualizationObjectContent),
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
    visualization: IVisualization,
    visualizationClassUri: string,
    userMap?: Map<string, IUser>,
): IInsight => {
    const withResolvedReferences = resolveReferences(visualization.visualizationObject);
    const { content, meta } = withResolvedReferences;
    const parsedProperties = deserializeProperties(content.properties);
    const attributeFilterConfigs = content.attributeFilterConfigs;

    return {
        insight: {
            buckets: content.buckets.map(convertBucket),
            filters: content.filters ? compact(content.filters.map(convertFilter)) : [],
            ...(attributeFilterConfigs ? { attributeFilterConfigs: attributeFilterConfigs } : {}),
            ...(content.layers ? { layers: content.layers } : {}),
            ...(content.parameters ? { parameters: content.parameters } : {}),
            ref: uriRef(meta.uri),
            // we assume that identifier is always defined for visualizations
            identifier: meta.identifier,
            properties: parsedProperties,
            sorts: parsedProperties["sortItems"] || [],
            title: meta.title,
            uri: meta.uri,
            visualizationUrl: visualizationClassUri,
            created: meta.created,
            createdBy: meta.author ? userMap?.get(meta.author) : undefined,
            updated: meta.updated,
            updatedBy: meta.contributor ? userMap?.get(meta.contributor) : undefined,
            isLocked: meta.locked,
            tags: meta.tags?.filter(Boolean) ?? [],
            summary: meta.summary ?? "",
        },
    };
};
