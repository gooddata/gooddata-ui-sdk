// (C) 2019-2025 GoodData Corporation
import { messages } from "../../locales.js";
import { type MeasureValueFilterOperator } from "../types.js";

export const getOperatorTranslationKey = (operator: MeasureValueFilterOperator): string | undefined => {
    switch (operator) {
        case "ALL":
            return messages["ALL"].id;
        case "GREATER_THAN":
            return messages["GREATER_THAN"].id;
        case "GREATER_THAN_OR_EQUAL_TO":
            return messages["GREATER_THAN_OR_EQUAL_TO"].id;
        case "LESS_THAN":
            return messages["LESS_THAN"].id;
        case "LESS_THAN_OR_EQUAL_TO":
            return messages["LESS_THAN_OR_EQUAL_TO"].id;
        case "EQUAL_TO":
            return messages["EQUAL_TO"].id;
        case "NOT_EQUAL_TO":
            return messages["NOT_EQUAL_TO"].id;
        case "BETWEEN":
            return messages["BETWEEN"].id;
        case "NOT_BETWEEN":
            return messages["NOT_BETWEEN"].id;
        default:
            return undefined;
    }
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
