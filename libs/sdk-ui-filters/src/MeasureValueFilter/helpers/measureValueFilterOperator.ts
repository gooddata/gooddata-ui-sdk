// (C) 2019-2020 GoodData Corporation
import { MeasureValueFilterOperator } from "../types";

export const getOperatorTranslationKey = (operator: MeasureValueFilterOperator): string => {
    const translationKeysDictionary: {
        [K in MeasureValueFilterOperator]: string;
    } = {
        ALL: "all",
        GREATER_THAN: "greaterThan",
        GREATER_THAN_OR_EQUAL_TO: "greaterThanOrEqualTo",
        LESS_THAN: "lessThan",
        LESS_THAN_OR_EQUAL_TO: "lessThanOrEqualTo",
        EQUAL_TO: "equalTo",
        NOT_EQUAL_TO: "notEqualTo",
        BETWEEN: "between",
        NOT_BETWEEN: "notBetween",
    };

    return `mvf.operator.${translationKeysDictionary[operator]}`;
};

export const getOperatorIcon = (operator: MeasureValueFilterOperator): string => {
    const iconNamesDictionary: {
        [K in MeasureValueFilterOperator]: string;
    } = {
        ALL: "all",
        GREATER_THAN: "greater-than",
        GREATER_THAN_OR_EQUAL_TO: "greater-than-equal-to",
        LESS_THAN: "less-than",
        LESS_THAN_OR_EQUAL_TO: "less-than-equal-to",
        EQUAL_TO: "equal-to",
        NOT_EQUAL_TO: "not-equal-to",
        BETWEEN: "between",
        NOT_BETWEEN: "not-between",
    };

    return iconNamesDictionary[operator];
};
