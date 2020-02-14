// (C) 2019 GoodData Corporation
import { ComparisonConditionOperator, RangeConditionOperator } from "@gooddata/sdk-model";

export type MeasureValueFilterOperator = ComparisonConditionOperator | RangeConditionOperator | "ALL";

export interface IValue {
    value?: number;
    from?: number;
    to?: number;
}
