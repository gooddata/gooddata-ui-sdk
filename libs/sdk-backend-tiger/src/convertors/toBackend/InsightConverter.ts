// (C) 2019-2021 GoodData Corporation
import {
    absoluteDateFilterValues,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    DateAttributeGranularity,
    filterAttributeElements,
    filterMeasureRef,
    filterObjRef,
    IAttribute,
    IAttributeElementsByValue,
    IAttributeOrMeasure,
    IBucket,
    IFilter,
    IInsightDefinition,
    IMeasureFilter,
    IMeasureValueFilter,
    insightBuckets,
    insightFilters,
    insightProperties,
    insightSorts,
    insightVisualizationUrl,
    IRankingFilter,
    isAbsoluteDateFilter,
    isMeasure,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRankingFilter,
    measureValueFilterCondition,
    measureValueFilterMeasure,
    rankingFilterOperator,
    rankingFilterValue,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import {
    ComparisonMeasureValueFilterBodyOperatorEnum,
    FilterDefinition,
    FilterDefinitionForSimpleMeasure,
    MeasureValueFilter,
    RangeMeasureValueFilterBodyOperatorEnum,
    RankingFilter,
    RankingFilterBodyOperatorEnum,
    VisualizationObjectModelV2,
} from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";
import { toObjQualifier, toObjQualifierInScope } from "./ObjRefConverter";
import { convertMeasure } from "./afm/MeasureConverter";
import invariant from "ts-invariant";
import { toTigerGranularity } from "../fromBackend/dateGranularityConversions";

function convertMeasureValueFilter(filter: IMeasureValueFilter): MeasureValueFilter {
    const condition = measureValueFilterCondition(filter);
    invariant(condition);
    const measure = measureValueFilterMeasure(filter);
    if (isRangeCondition(condition)) {
        return {
            rangeMeasureValueFilter: {
                from: condition.range.from,
                to: condition.range.to,
                operator: condition.range.operator as RangeMeasureValueFilterBodyOperatorEnum,
                treatNullValuesAs: condition.range.treatNullValuesAs,
                measure: toObjQualifierInScope(measure),
            },
        };
    } else {
        return {
            comparisonMeasureValueFilter: {
                value: condition.comparison.value,
                operator: condition.comparison.operator as ComparisonMeasureValueFilterBodyOperatorEnum,
                treatNullValuesAs: condition.comparison.treatNullValuesAs,
                measure: toObjQualifierInScope(measure),
            },
        };
    }
}

function convertRankingFilter(filter: IRankingFilter): RankingFilter {
    return {
        rankingFilter: {
            measures: [toObjQualifierInScope(filterMeasureRef(filter)!)], // TODO what to do here with the other measures and attributes?
            operator: rankingFilterOperator(filter) as RankingFilterBodyOperatorEnum,
            value: rankingFilterValue(filter),
        },
    };
}

function convertFilter(filter: IFilter): FilterDefinition {
    if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else {
        return convertMeasureFilter(filter);
    }
}

function convertMeasureFilter(filter: IMeasureFilter): FilterDefinitionForSimpleMeasure {
    if (isPositiveAttributeFilter(filter)) {
        return {
            positiveAttributeFilter: {
                in: filterAttributeElements(filter) as IAttributeElementsByValue,
                label: toObjQualifier(filterObjRef(filter)),
            },
        };
    } else if (isNegativeAttributeFilter(filter)) {
        return {
            negativeAttributeFilter: {
                notIn: filterAttributeElements(filter) as IAttributeElementsByValue,
                label: toObjQualifier(filterObjRef(filter)),
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        const { from, to } = absoluteDateFilterValues(filter);
        return {
            absoluteDateFilter: {
                dataset: toObjQualifier(filterObjRef(filter)),
                from,
                to,
            },
        };
    } else {
        const { from, to, granularity } = relativeDateFilterValues(filter);
        return {
            relativeDateFilter: {
                dataset: toObjQualifier(filterObjRef(filter)),
                from,
                to,
                granularity: toTigerGranularity(granularity as DateAttributeGranularity),
            },
        };
    }
}

function convertAttribute(attribute: IAttribute): VisualizationObjectModelV2.IAttribute {
    return {
        label: toObjQualifier(attributeDisplayFormRef(attribute)),
        localIdentifier: attributeLocalId(attribute),
        alias: attributeAlias(attribute),
    };
}

function convertBucketItem(bucketItem: IAttributeOrMeasure): VisualizationObjectModelV2.IAttributeOrMeasure {
    return isMeasure(bucketItem) ? convertMeasure(bucketItem) : convertAttribute(bucketItem);
}

function convertBucket(bucket: IBucket): VisualizationObjectModelV2.IBucket {
    return {
        ...bucket,
        items: bucket.items.map(convertBucketItem),
    };
}

export function convertInsight(insight: IInsightDefinition): VisualizationObjectModelV2.IVisualizationObject {
    return {
        visualizationUrl: insightVisualizationUrl(insight),
        properties: insightProperties(insight),
        buckets: insightBuckets(insight).map(convertBucket),
        filters: insightFilters(insight).map(convertFilter),
        sorts: cloneWithSanitizedIds(insightSorts(insight)),
        version: "2",
    };
}
