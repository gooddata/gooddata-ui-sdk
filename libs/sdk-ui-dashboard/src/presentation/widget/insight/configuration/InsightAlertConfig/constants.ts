// (C) 2024 GoodData Corporation
import { IAlertComparisonOperator } from "@gooddata/sdk-model";

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
        title: "Is greater than",
        icon: "gd-icon-greater-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN,
    },
    {
        title: "Is greater than or equal to",
        icon: "gd-icon-greater-than-equal-to",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUALS,
    },
    {
        title: "Is less than",
        icon: "gd-icon-less-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN,
    },
    {
        title: "Is less than or equal to",
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
