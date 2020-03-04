// (C) 2019-2020 GoodData Corporation
import { ComparisonConditionOperator, RangeConditionOperator } from "@gooddata/sdk-model";

export type MeasureValueFilterOperator = ComparisonConditionOperator | RangeConditionOperator | "ALL";

export interface IMeasureValueFilterValue {
    value?: number;
    from?: number;
    to?: number;
}
