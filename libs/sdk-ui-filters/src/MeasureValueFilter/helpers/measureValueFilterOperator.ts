// (C) 2019-2022 GoodData Corporation
import { MeasureValueFilterOperator } from "../types.js";
import { messages } from "../../locales.js";

export const getOperatorTranslationKey = (operator: MeasureValueFilterOperator): string => {
    return messages[operator].id;
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
