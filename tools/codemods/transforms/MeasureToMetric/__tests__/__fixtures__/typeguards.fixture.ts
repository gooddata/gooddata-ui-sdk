// (C) 2022 GoodData Corporation
import {
    isMeasure,
    isSimpleMeasure,
    isAdhocMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isArithmeticMeasure,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isArithmeticMeasureDefinition,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

const input = {};

export const isMeasureResult = isMeasure(input);
export const isSimpleMeasureResult = isSimpleMeasure(input);
export const isAdhocMeasureResult = isAdhocMeasure(input);
export const isPoPMeasureResult = isPoPMeasure(input);
export const isPreviousPeriodMeasureResult = isPreviousPeriodMeasure(input);
export const isArithmeticMeasureResult = isArithmeticMeasure(input);
export const isMeasureDefinitionResult = isMeasureDefinition(input);
export const isPoPMeasureDefinitionResult = isPoPMeasureDefinition(input);
export const isPreviousPeriodMeasureDefinitionResult = isPreviousPeriodMeasureDefinition(input);
export const isArithmeticMeasureDefinitionResult = isArithmeticMeasureDefinition(input);
export const isMeasureValueFilterResult = isMeasureValueFilter(input);

export const pointFree = [].filter(isPoPMeasure);
