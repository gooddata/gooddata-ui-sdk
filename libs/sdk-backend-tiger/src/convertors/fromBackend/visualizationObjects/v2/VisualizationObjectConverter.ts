// (C) 2019-2021 GoodData Corporation
import {
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IFilter,
    IInsightDefinition,
    IMeasure,
    IMeasureFilter,
    IMeasureValueFilter,
    IRankingFilter,
    newAbsoluteDateFilter,
    newArithmeticMeasure,
    newAttribute,
    newMeasure,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPopMeasure,
    newPositiveAttributeFilter,
    newPreviousPeriodMeasure,
    newRankingFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import {
    AbsoluteDateFilter,
    ArithmeticMeasureDefinition,
    ComparisonMeasureValueFilter,
    FilterDefinition,
    FilterDefinitionForSimpleMeasure,
    InlineFilterDefinition,
    MeasureValueFilter,
    NegativeAttributeFilter,
    PopDatasetMeasureDefinition,
    PopDateMeasureDefinition,
    PositiveAttributeFilter,
    RangeMeasureValueFilter,
    RankingFilter,
    RelativeDateFilter,
    SimpleMeasureDefinition,
    VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "../../IdSanitization";
import { toObjRef, toObjRefInScope } from "../../ObjRefConverter";
import isEmpty from "lodash/isEmpty";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { toSdkGranularity } from "../../dateGranularityConversions";
import { toSdkAggregation } from "../../aggregationConversions";
import { toSdkArithmeticOperator } from "../../arithmeticOperatorConversions";

function isComparisonMeasureValueFilter(filter: unknown): filter is ComparisonMeasureValueFilter {
    return !isEmpty(filter) && !!(filter as ComparisonMeasureValueFilter).comparisonMeasureValueFilter;
}

function isRangeMeasureValueFilter(filter: unknown): filter is RangeMeasureValueFilter {
    return !isEmpty(filter) && !!(filter as RangeMeasureValueFilter).rangeMeasureValueFilter;
}

function isMeasureValueFilter(filter: unknown): filter is MeasureValueFilter {
    return isComparisonMeasureValueFilter(filter) || isRangeMeasureValueFilter(filter);
}

function isRankingFilter(filter: unknown): filter is RankingFilter {
    return !isEmpty(filter) && !!(filter as RankingFilter).rankingFilter;
}

function isPositiveAttributeFilter(filter: unknown): filter is PositiveAttributeFilter {
    return !isEmpty(filter) && !!(filter as PositiveAttributeFilter).positiveAttributeFilter;
}

function isNegativeAttributeFilter(filter: unknown): filter is NegativeAttributeFilter {
    return !isEmpty(filter) && !!(filter as NegativeAttributeFilter).negativeAttributeFilter;
}

function isAbsoluteDateFilter(filter: unknown): filter is AbsoluteDateFilter {
    return !isEmpty(filter) && !!(filter as AbsoluteDateFilter).absoluteDateFilter;
}

function isRelativeDateFilter(filter: unknown): filter is RelativeDateFilter {
    return !isEmpty(filter) && !!(filter as RelativeDateFilter).relativeDateFilter;
}

function isInlineFilter(filter: unknown): filter is InlineFilterDefinition {
    return !isEmpty(filter) && !!(filter as InlineFilterDefinition).inline;
}

function convertMeasureValueFilter(filter: MeasureValueFilter): IMeasureValueFilter {
    if (isRangeMeasureValueFilter(filter)) {
        const { from, to, measure, operator, treatNullValuesAs } = filter.rangeMeasureValueFilter;
        return newMeasureValueFilter(toObjRefInScope(measure), operator, from, to, treatNullValuesAs);
    } else {
        const { value, measure, operator, treatNullValuesAs } = filter.comparisonMeasureValueFilter;
        return newMeasureValueFilter(toObjRefInScope(measure), operator, value, treatNullValuesAs);
    }
}

function convertRankingFilter(filter: RankingFilter): IRankingFilter {
    const { measures, operator, value } = filter.rankingFilter;
    return newRankingFilter(toObjRefInScope(measures[0]), operator, value); // TODO what to do here with the other measures?
}

function convertFilter(filter: FilterDefinition): IFilter {
    if (isInlineFilter(filter)) {
        throw new NotSupported("SPI does not support inline filters");
    } else if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else {
        return convertMeasureFilter(filter);
    }
}

function convertMeasureFilter(filter: FilterDefinitionForSimpleMeasure): IMeasureFilter {
    if (isPositiveAttributeFilter(filter)) {
        const { label, in: _in } = filter.positiveAttributeFilter;
        return newPositiveAttributeFilter(toObjRef(label), _in);
    } else if (isNegativeAttributeFilter(filter)) {
        const { label, notIn } = filter.negativeAttributeFilter;
        return newNegativeAttributeFilter(toObjRef(label), notIn);
    } else if (isAbsoluteDateFilter(filter)) {
        const { dataset, from, to } = filter.absoluteDateFilter;
        return newAbsoluteDateFilter(toObjRef(dataset), from, to);
    } else if (isRelativeDateFilter(filter)) {
        const { dataset, granularity, from, to } = filter.relativeDateFilter;
        return newRelativeDateFilter(toObjRef(dataset), toSdkGranularity(granularity), from, to);
    } else {
        throw new UnexpectedError("Unsupported filter type");
    }
}

function convertMeasure(measure: VisualizationObjectModelV2.IMeasure): IMeasure {
    const { alias, localIdentifier, format, definition } = measure;
    if ((definition as SimpleMeasureDefinition).measure) {
        const { item, aggregation, computeRatio, filters } = (definition as SimpleMeasureDefinition).measure;

        return newMeasure(toObjRef(item), (m) =>
            m
                .alias(alias)
                .format(format)
                .localId(localIdentifier)
                .aggregation(aggregation && toSdkAggregation(aggregation))
                .ratio(!!computeRatio)
                .filters(...(filters ?? []).map(convertMeasureFilter)),
        );
    } else if ((definition as ArithmeticMeasureDefinition).arithmeticMeasure) {
        const {
            measureIdentifiers,
            operator,
        } = (definition as ArithmeticMeasureDefinition).arithmeticMeasure;

        return newArithmeticMeasure(
            measureIdentifiers.map((id) => id.localIdentifier),
            toSdkArithmeticOperator(operator),
            (m) => m.alias(alias).format(format).localId(localIdentifier),
        );
    } else if ((definition as PopDatasetMeasureDefinition).previousPeriodMeasure) {
        const {
            dateDatasets,
            measureIdentifier,
        } = (definition as PopDatasetMeasureDefinition).previousPeriodMeasure;

        return newPreviousPeriodMeasure(
            measureIdentifier.localIdentifier,
            dateDatasets.map((ds) => ({
                dataSet: toObjRef(ds.dataset),
                periodsAgo: ds.periodsAgo,
            })),
            (m) => m.alias(alias).format(format).localId(localIdentifier),
        );
    } else if ((definition as PopDateMeasureDefinition).overPeriodMeasure) {
        const {
            measureIdentifier,
            dateAttributes,
        } = (definition as PopDateMeasureDefinition).overPeriodMeasure;

        // TODO what about the rest of date attributes?
        return newPopMeasure(measureIdentifier.localIdentifier, toObjRef(dateAttributes[0].attribute), (m) =>
            m.alias(alias).format(format).localId(localIdentifier),
        );
    }

    return cloneWithSanitizedIds(measure);
}

function convertAttribute(attribute: VisualizationObjectModelV2.IAttribute): IAttribute {
    const { label, localIdentifier, alias } = attribute;
    return newAttribute(toObjRef(label), (a) => a.alias(alias).localId(localIdentifier));
}

function convertBucketItem(bucketItem: VisualizationObjectModelV2.IAttributeOrMeasure): IAttributeOrMeasure {
    return VisualizationObjectModelV2.isMeasure(bucketItem)
        ? convertMeasure(bucketItem)
        : convertAttribute(bucketItem);
}

function convertBucket(bucket: VisualizationObjectModelV2.IBucket): IBucket {
    return {
        ...bucket,
        items: bucket.items.map(convertBucketItem),
    };
}

export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV2.IVisualizationObject,
    title: string,
): IInsightDefinition {
    return {
        insight: {
            title,
            properties: visualizationObject.properties,
            visualizationUrl: visualizationObject.visualizationUrl,
            buckets: (visualizationObject.buckets ?? []).map(convertBucket),
            filters: (visualizationObject.filters ?? []).map(convertFilter),
            sorts: cloneWithSanitizedIds(visualizationObject.sorts) ?? [],
        },
    };
}
