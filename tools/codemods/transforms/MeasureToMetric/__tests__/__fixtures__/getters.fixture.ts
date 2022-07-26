// (C) 2022 GoodData Corporation
import {
    measureLocalId,
    measureUri,
    measureIdentifier,
    measureItem,
    measureDoesComputeRatio,
    measureMasterIdentifier,
    measureArithmeticOperands,
    measureArithmeticOperator,
    measureAlias,
    measureTitle,
    measureFormat,
    isMeasureFormatInPercent,
    measureAggregation,
    measureFilters,
    measurePopAttribute,
    measurePreviousPeriodDateDataSets,
    measureValueFilterMeasure,
    measureValueFilterCondition,
    measureValueFilterOperator,
} from "@gooddata/sdk-model";

export const measure = {} as any;

export const measureLocalIdResult = measureLocalId(measure);
export const measureUriResult = measureUri(measure);
export const measureIdentifierResult = measureIdentifier(measure);
export const measureItemResult = measureItem(measure);
export const measureDoesComputeRatioResult = measureDoesComputeRatio(measure);
export const measureMasterIdentifierResult = measureMasterIdentifier(measure);
export const measureArithmeticOperandsResult = measureArithmeticOperands(measure);
export const measureArithmeticOperatorResult = measureArithmeticOperator(measure);
export const measureAliasResult = measureAlias(measure);
export const measureTitleResult = measureTitle(measure);
export const measureFormatResult = measureFormat(measure);
export const isMeasureFormatInPercentResult = isMeasureFormatInPercent(measure);
export const measureAggregationResult = measureAggregation(measure);
export const measureFiltersResult = measureFilters(measure);
export const measurePopAttributeResult = measurePopAttribute(measure);
export const measurePreviousPeriodDateDataSetsResult = measurePreviousPeriodDateDataSets(measure);
export const measureValueFilterMeasureResult = measureValueFilterMeasure(measure);
export const measureValueFilterConditionResult = measureValueFilterCondition(measure);
export const measureValueFilterOperatorResult = measureValueFilterOperator(measure);

export const pointFree = [].map(isMeasureFormatInPercent);
