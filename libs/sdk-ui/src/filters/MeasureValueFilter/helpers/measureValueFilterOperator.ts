// (C) 2019 GoodData Corporation
import { MeasureValueFilterOperator } from "../types";

export const getOperatorTranslationKey = (operator: MeasureValueFilterOperator) => {
    // TODO remove partial after adding equal and not equal
    const translationKeysDictionary: Partial<
        {
            [K in MeasureValueFilterOperator]: string;
        }
    > = {
        ALL: "all",
        GREATER_THAN: "greaterThan",
        GREATER_THAN_OR_EQUAL_TO: "greaterThanOrEqualTo",
        LESS_THAN: "lessThan",
        LESS_THAN_OR_EQUAL_TO: "lessThanOrEqualTo",
        BETWEEN: "between",
        NOT_BETWEEN: "notBetween",
    };

    return `mvf.operator.${translationKeysDictionary[operator]}`;
};

export const getOperatorIcon = (operator: MeasureValueFilterOperator) => {
    // TODO remove partial after adding equal and not equal
    const iconNamesDictionary: Partial<
        {
            [K in MeasureValueFilterOperator]: string;
        }
    > = {
        ALL: "all",
        GREATER_THAN: "greater-than",
        GREATER_THAN_OR_EQUAL_TO: "greater-than-equal-to",
        LESS_THAN: "less-than",
        LESS_THAN_OR_EQUAL_TO: "less-than-equal-to",
        BETWEEN: "between",
        NOT_BETWEEN: "not-between",
    };

    return iconNamesDictionary[operator];
};
