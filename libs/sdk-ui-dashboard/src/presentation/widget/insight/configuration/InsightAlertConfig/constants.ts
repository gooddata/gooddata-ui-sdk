// (C) 2024 GoodData Corporation
import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import { messages } from "./messages.js";

export const COMPARISON_OPERATOR_LESS_THAN = "LESS_THAN";
export const COMPARISON_OPERATOR_LESS_THAN_OR_EQUALS = "LESS_THAN_OR_EQUALS";
export const COMPARISON_OPERATOR_GREATER_THAN = "GREATER_THAN";
export const COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS = "GREATER_THAN_OR_EQUALS";

export const COMPARISON_OPERATORS = {
    COMPARISON_OPERATOR_LESS_THAN,
    COMPARISON_OPERATOR_LESS_THAN_OR_EQUALS,
    COMPARISON_OPERATOR_GREATER_THAN,
    COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS,
} as const;

export const COMPARISON_OPERATOR_OPTIONS: {
    title: string;
    icon: string;
    id: IAlertComparisonOperator;
}[] = [
    {
        title: messages.comparisonOperatorGreaterThan.id,
        icon: "gd-icon-greater-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN,
    },
    {
        title: messages.comparisonOperatorGreaterThanOrEquals.id,
        icon: "gd-icon-greater-than-equal-to",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS,
    },
    {
        title: messages.comparisonOperatorLessThan.id,
        icon: "gd-icon-less-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN,
    },
    {
        title: messages.comparisonOperatorLessThanOrEquals.id,
        icon: "gd-icon-less-than-equal-to",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUALS,
    },
];

export const DROPDOWN_ITEM_HEIGHT = 28;
export const DROPDOWN_SEPARATOR_ITEM_HEIGHT = 10;

// TODO: replace with proper notification channels once we refactor IWebhookMetadataObject -> INotificationChannelMetadataObject channel in sdk-model & sdk-backend-spi
export interface INotificationChannel {
    id: string;
    title: string;
}
