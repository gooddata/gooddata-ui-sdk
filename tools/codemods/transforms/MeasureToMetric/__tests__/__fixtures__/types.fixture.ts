// (C) 2022 GoodData Corporation
import {
    IMeasure,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IArithmeticMeasureDefinition,
    IMeasureDefinition,
    IMeasureValueFilter,
    IMeasureValueFilterBody,
    MeasureValueFilterCondition,
} from "@gooddata/sdk-model";

export const measure: IMeasure = {} as any;
export const measure2: IMeasure<IMeasureDefinition> = {} as any;
export const popMeasure: IMeasure<IPoPMeasureDefinition> = {} as any;
export const ppMeasure: IMeasure<IPreviousPeriodMeasureDefinition> = {} as any;
export const arithmetic: IMeasure<IArithmeticMeasureDefinition> = {} as any;
export const mvf: IMeasureValueFilter = {} as any;
export const mvfBody: IMeasureValueFilterBody = {} as any;
export const mvfCondition: MeasureValueFilterCondition = {} as any;

export type MyType = IMeasure | IMeasureValueFilter;

export interface MyInterface extends IMeasure {
    filter: IMeasureValueFilter;
}
