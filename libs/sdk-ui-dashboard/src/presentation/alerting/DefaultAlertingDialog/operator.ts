// (C) 2022-2024 GoodData Corporation

import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import { defineMessages, IntlShape } from "react-intl";

const messages = defineMessages({
    greaterThan: {
        id: "alerting.comparisonOperator.greaterThan",
    },
    greaterThanOrEquals: {
        id: "alerting.comparisonOperator.greaterThanOrEquals",
    },
    lessThan: {
        id: "alerting.comparisonOperator.lessThan",
    },
    lessThanOrEquals: {
        id: "alerting.comparisonOperator.lessThanOrEquals",
    },
});

export function translateOperator(intl: IntlShape, operator?: IAlertComparisonOperator) {
    switch (operator) {
        case "GREATER_THAN":
            return intl.formatMessage(messages.greaterThan);
        case "GREATER_THAN_OR_EQUAL_TO":
            return intl.formatMessage(messages.greaterThanOrEquals);
        case "LESS_THAN":
            return intl.formatMessage(messages.lessThan);
        case "LESS_THAN_OR_EQUAL_TO":
            return intl.formatMessage(messages.lessThanOrEquals);
        default:
            return String(operator).toLowerCase();
    }
}
