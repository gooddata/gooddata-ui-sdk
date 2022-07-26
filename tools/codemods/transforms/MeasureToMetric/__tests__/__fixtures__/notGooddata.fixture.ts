// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-unused-vars */
// disable TS checks here, we need to simulate an unrelated package
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IArithmeticMeasureDefinition,
    IMeasureDefinition,
    IMeasureValueFilter,
    IMeasureValueFilterBody,
    MeasureValueFilterCondition,
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
} from "@gooddata/unrelated-package-with-gooddata-names"; // eslint-disable-line import/no-unresolved

const measure: IMeasure = {} as any;
const measure2: IMeasure<IMeasureDefinition> = {} as any;
const popMeasure: IMeasure<IPoPMeasureDefinition> = {} as any;
const ppMeasure: IMeasure<IPreviousPeriodMeasureDefinition> = {} as any;
const arithmetic: IMeasure<IArithmeticMeasureDefinition> = {} as any;
const mvf: IMeasureValueFilter = {} as any;
const mvfBody: IMeasureValueFilterBody = {} as any;
const mvfCondition: MeasureValueFilterCondition = {} as any;

const measureLocalIdResult = measureLocalId(measure);
const measureUriResult = measureUri(measure);
const measureIdentifierResult = measureIdentifier(measure);
const measureItemResult = measureItem(measure);
const measureDoesComputeRatioResult = measureDoesComputeRatio(measure);
const measureMasterIdentifierResult = measureMasterIdentifier(measure);
const measureArithmeticOperandsResult = measureArithmeticOperands(measure);
const measureArithmeticOperatorResult = measureArithmeticOperator(measure);
const measureAliasResult = measureAlias(measure);
const measureTitleResult = measureTitle(measure);
const measureFormatResult = measureFormat(measure);
const isMeasureFormatInPercentResult = isMeasureFormatInPercent(measure);
const measureAggregationResult = measureAggregation(measure);
const measureFiltersResult = measureFilters(measure);
const measurePopAttributeResult = measurePopAttribute(measure);
const measurePreviousPeriodDateDataSetsResult = measurePreviousPeriodDateDataSets(measure);
const measureValueFilterMeasureResult = measureValueFilterMeasure(measure);
const measureValueFilterConditionResult = measureValueFilterCondition(measure);
const measureValueFilterOperatorResult = measureValueFilterOperator(measure);
