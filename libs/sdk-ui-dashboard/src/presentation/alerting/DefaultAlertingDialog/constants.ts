// (C) 2024-2025 GoodData Corporation
import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import { SingleSelectListItemType } from "@gooddata/sdk-ui-kit";
import { messages } from "./messages.js";

export type OperatorItemType<T = IAlertComparisonOperator> = {
    title: string;
    icon: string;
    id: T;
    type?: SingleSelectListItemType;
    info?: string;
};

export const COMPARISON_OPERATOR_LESS_THAN = "LESS_THAN";
export const COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO";
export const COMPARISON_OPERATOR_GREATER_THAN = "GREATER_THAN";
export const COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO";

export const RELATIVE_OPERATOR_INCREASE_BY = "INCREASES_BY";
export const RELATIVE_OPERATOR_DECREASE_BY = "DECREASES_BY";
export const RELATIVE_OPERATOR_CHANGES_BY = "CHANGES_BY";

export const ARITHMETIC_OPERATOR_DIFFERENCE = "DIFFERENCE";
export const ARITHMETIC_OPERATOR_CHANGE = "CHANGE";

export const COMPARISON_OPERATORS = {
    COMPARISON_OPERATOR_LESS_THAN,
    COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO,
    COMPARISON_OPERATOR_GREATER_THAN,
    COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO,
} as const;

export const RELATIVE_OPERATORS = {
    RELATIVE_OPERATOR_INCREASE_BY,
    RELATIVE_OPERATOR_DECREASE_BY,
    RELATIVE_OPERATOR_CHANGES_BY,
} as const;

export const ARITHMETIC_OPERATORS = {
    ARITHMETIC_OPERATOR_DIFFERENCE,
    ARITHMETIC_OPERATOR_CHANGE,
} as const;

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
export const RELATIVE_CHANGE_OPERATOR_OPTIONS: OperatorItemType<any>[] = [
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
export const RELATIVE_DIFFERENCE_OPERATOR_OPTIONS: OperatorItemType<any>[] = [
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

export const OPERATORS = [
    ...COMPARISON_OPERATOR_OPTIONS,
    ...RELATIVE_CHANGE_OPERATOR_OPTIONS,
    ...RELATIVE_DIFFERENCE_OPERATOR_OPTIONS,
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

export const SEPARATOR: OperatorItemType<string> = {
    type: "separator",
    title: "",
    icon: "",
    id: "",
};

export const DROPDOWN_ITEM_HEIGHT = 28;
export const DROPDOWN_SEPARATOR_ITEM_HEIGHT = 10;
export const DEFAULT_MEASURE_FORMAT = "#,##0.00";
