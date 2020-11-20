// (C) 2007-2020 GoodData Corporation
import {
    AbsoluteDateFilter,
    AttributeFilter,
    ComparisonMeasureValueFilterBodyOperatorEnum,
    FilterDefinition,
    MeasureValueFilter,
    NegativeAttributeFilter,
    PositiveAttributeFilter,
    RangeMeasureValueFilterBodyOperatorEnum,
    RankingFilter,
    RankingFilterBodyOperatorEnum,
    RelativeDateFilter,
} from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    filterIsEmpty,
    IAbsoluteDateFilter,
    IAttributeFilter,
    IFilter,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRankingFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAttributeElementsByValue,
    isAttributeFilter,
    isComparisonCondition,
    isMeasureValueFilter,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRankingFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";
import { toTigerGranularity } from "../../fromBackend/dateGranularityConversions";
import {
    toDateDataSetQualifier,
    toDisplayFormQualifier,
    toMeasureValueFilterMeasureQualifier,
    toRankingFilterDimensionalityIdentifier,
} from "../ObjRefConverter";

function convertPositiveFilter(filter: IPositiveAttributeFilter): PositiveAttributeFilter {
    const displayFormRef = filter.positiveAttributeFilter.displayForm;
    const attributeElements = filter.positiveAttributeFilter.in;

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        positiveAttributeFilter: {
            displayForm: toDisplayFormQualifier(displayFormRef),
            in: attributeElements,
        },
    };
}

function convertNegativeFilter(filter: INegativeAttributeFilter): NegativeAttributeFilter | null {
    const displayFormRef = filter.negativeAttributeFilter.displayForm;
    const attributeElements = filter.negativeAttributeFilter.notIn;

    if (!isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported("Tiger backend only allows specifying attribute elements by value");
    }

    return {
        negativeAttributeFilter: {
            displayForm: toDisplayFormQualifier(displayFormRef),
            notIn: attributeElements,
        },
    };
}

function convertAttributeFilter(filter: IAttributeFilter): AttributeFilter | null {
    if (filterIsEmpty(filter)) {
        return null;
    }

    if (isPositiveAttributeFilter(filter)) {
        return convertPositiveFilter(filter);
    }

    return convertNegativeFilter(filter);
}

export function convertAbsoluteDateFilter(filter: IAbsoluteDateFilter): AbsoluteDateFilter | null {
    const { absoluteDateFilter } = filter;

    if (absoluteDateFilter.from === undefined || absoluteDateFilter.to === undefined) {
        return null;
    }

    const datasetRef = absoluteDateFilter.dataSet;

    return {
        absoluteDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
            from: String(absoluteDateFilter.from),
            to: String(absoluteDateFilter.to),
        },
    };
}

export function convertRelativeDateFilter(filter: IRelativeDateFilter): RelativeDateFilter | null {
    const { relativeDateFilter } = filter;

    if (relativeDateFilter.from === undefined || !relativeDateFilter.to === undefined) {
        return null;
    }

    const datasetRef = relativeDateFilter.dataSet;

    return {
        relativeDateFilter: {
            dataset: toDateDataSetQualifier(datasetRef),
            granularity: toTigerGranularity(relativeDateFilter.granularity as any),
            from: Number(relativeDateFilter.from),
            to: Number(relativeDateFilter.to),
        },
    };
}

export function convertMeasureValueFilter(filter: IMeasureValueFilter): MeasureValueFilter | null {
    const { measureValueFilter } = filter;
    const condition = measureValueFilter.condition;

    if (isComparisonCondition(condition)) {
        const { operator, value, treatNullValuesAs } = condition.comparison;
        return {
            comparisonMeasureValueFilter: {
                measure: toMeasureValueFilterMeasureQualifier(measureValueFilter.measure),
                // Operator has same values, we only need type assertion
                operator: operator as ComparisonMeasureValueFilterBodyOperatorEnum,
                value,
                treatNullValuesAs,
            },
        };
    }

    if (isRangeCondition(condition)) {
        const { operator, from: originalFrom, to: originalTo, treatNullValuesAs } = condition.range;
        return {
            rangeMeasureValueFilter: {
                measure: toMeasureValueFilterMeasureQualifier(measureValueFilter.measure),
                // Operator has same values, we only need type assertion
                operator: operator as RangeMeasureValueFilterBodyOperatorEnum,
                // make sure the boundaries are always from <= to, because tiger backend cannot handle from > to in a user friendly way
                // this is effectively the same behavior as in bear
                from: Math.min(originalFrom, originalTo),
                to: Math.max(originalFrom, originalTo),
                treatNullValuesAs,
            },
        };
    }

    return null;
}

export function convertRankingFilter(filter: IRankingFilter): RankingFilter {
    const { measure, attributes, operator, value } = filter.rankingFilter;
    const dimensionalityProp = attributes
        ? { dimensionality: attributes.map(toRankingFilterDimensionalityIdentifier) }
        : {};
    return {
        rankingFilter: {
            measures: [toMeasureValueFilterMeasureQualifier(measure)],
            ...dimensionalityProp,
            operator: operator as RankingFilterBodyOperatorEnum,
            value,
        },
    };
}

export function convertFilter(filter: IFilter): FilterDefinition | null {
    if (isAttributeFilter(filter)) {
        return convertAttributeFilter(filter);
    } else if (isAbsoluteDateFilter(filter)) {
        return convertAbsoluteDateFilter(filter);
    } else if (isRelativeDateFilter(filter)) {
        return convertRelativeDateFilter(filter);
    } else if (isMeasureValueFilter(filter)) {
        return convertMeasureValueFilter(filter);
    } else if (isRankingFilter(filter)) {
        return convertRankingFilter(filter);
    } else {
        // eslint-disable-next-line no-console
        console.warn("Tiger does not support this filter. The filter will be ignored");
        return null;
    }
}
