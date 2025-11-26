// (C) 2024-2025 GoodData Corporation

import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import {
    AI_OPERATOR,
    AI_OPERATORS,
    ARITHMETIC_OPERATORS,
    COMPARISON_OPERATORS,
    RELATIVE_OPERATORS,
} from "@gooddata/sdk-ui-ext";
import { SingleSelectListItemType } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";

export type OperatorItemType<T = IAlertComparisonOperator> = {
    title: string;
    icon: string;
    id: T;
    type?: SingleSelectListItemType;
    info?: string;
};

export const COMPARISON_OPERATOR_OPTIONS: OperatorItemType[] = [
    {
        title: messages.comparisonOperatorGreaterThan.id,
        icon: "gd-icon-greater-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN,
    },
    {
        title: messages.comparisonOperatorGreaterThanOrEquals.id,
        icon: "gd-icon-greater-than-equal-to",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO,
    },
    {
        title: messages.comparisonOperatorLessThan.id,
        icon: "gd-icon-less-than",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN,
    },
    {
        title: messages.comparisonOperatorLessThanOrEquals.id,
        icon: "gd-icon-less-than-equal-to",
        id: COMPARISON_OPERATORS.COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO,
    },
];
export const RELATIVE_CHANGE_OPERATOR_OPTIONS: OperatorItemType<string>[] = [
    {
        title: messages.comparisonOperatorChangeIncreasesBy.id,
        icon: "gd-icon-increases-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}`,
    },
    {
        title: messages.comparisonOperatorChangeDecreasesBy.id,
        icon: "gd-icon-decreases-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}`,
    },
    {
        title: messages.comparisonOperatorChangeChangesBy.id,
        icon: "gd-icon-changes-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}`,
    },
];
export const RELATIVE_DIFFERENCE_OPERATOR_OPTIONS: OperatorItemType<string>[] = [
    {
        title: messages.comparisonOperatorDifferenceIncreasesBy.id,
        icon: "gd-icon-increases-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_INCREASE_BY}`,
    },
    {
        title: messages.comparisonOperatorDifferenceDecreasesBy.id,
        icon: "gd-icon-decreases-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_DECREASE_BY}`,
    },
    {
        title: messages.comparisonOperatorDifferenceChangesBy.id,
        icon: "gd-icon-changes-by",
        id: `${ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE}.${RELATIVE_OPERATORS.RELATIVE_OPERATOR_CHANGES_BY}`,
    },
];
export const ANOMALY_DETECTION_OPERATOR_OPTIONS: OperatorItemType<string>[] = [
    {
        title: messages.anomalyDetection.id,
        icon: "gd-icon-anomaly-detection",
        id: `${AI_OPERATOR}.${AI_OPERATORS.ANOMALY_DETECTION}`,
    },
];

export const OPERATORS = [
    ...COMPARISON_OPERATOR_OPTIONS,
    ...RELATIVE_CHANGE_OPERATOR_OPTIONS,
    ...RELATIVE_DIFFERENCE_OPERATOR_OPTIONS,
    ...ANOMALY_DETECTION_OPERATOR_OPTIONS,
];

export const CHANGE_HEADER: OperatorItemType<string> = {
    title: messages.comparisonOperatorChangeHeader.id,
    type: "header",
    icon: "",
    id: "",
    info: messages.comparisonOperatorChangeHeaderInfo.id,
};

export const DIFFERENCE_HEADER: OperatorItemType<string> = {
    title: messages.comparisonOperatorDifferenceHeader.id,
    type: "header",
    icon: "",
    id: "",
    info: messages.comparisonOperatorDifferenceHeaderInfo.id,
};

export const ANOMALY_DETECTION_HEADER: OperatorItemType<string> = {
    title: messages.aiOperatorHeader.id,
    type: "header",
    icon: "",
    id: "",
    info: messages.aiOperatorHeaderInfo.id,
};

export const SEPARATOR: OperatorItemType<string> = {
    type: "separator",
    title: "",
    icon: "",
    id: "",
};

export const DROPDOWN_ITEM_HEIGHT = 28;
export const DROPDOWN_SEPARATOR_ITEM_HEIGHT = 10;
export const DEFAULT_MEASURE_FORMAT = "#,##0.00";
export const ALERTING_DIALOG_ID = "alerting-dialog";
