// (C) 2024 GoodData Corporation
import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import { SingleSelectListItemType } from "@gooddata/sdk-ui-kit";
import { messages } from "./messages.js";

type OperatorItemType<T = IAlertComparisonOperator> = {
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

export const CHANGE_OPERATOR_INCREASE_BY = "CHANGE_INCREASE_BY";
export const CHANGE_OPERATOR_DECREASE_BY = "CHANGE_DECREASE_BY";
export const CHANGE_OPERATOR_CHANGES_BY = "CHANGE_CHANGES_BY";

export const DIFFERENCE_OPERATOR_INCREASE_BY = "DIFFERENCE_INCREASE_BY";
export const DIFFERENCE_OPERATOR_DECREASE_BY = "DIFFERENCE_DECREASE_BY";
export const DIFFERENCE_OPERATOR_CHANGES_BY = "DIFFERENCE_CHANGES_BY";

export const COMPARISON_OPERATORS = {
    COMPARISON_OPERATOR_LESS_THAN,
    COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO,
    COMPARISON_OPERATOR_GREATER_THAN,
    COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO,
    CHANGE_OPERATOR_INCREASE_BY,
    CHANGE_OPERATOR_DECREASE_BY,
    CHANGE_OPERATOR_CHANGES_BY,
    DIFFERENCE_OPERATOR_INCREASE_BY,
    DIFFERENCE_OPERATOR_DECREASE_BY,
    DIFFERENCE_OPERATOR_CHANGES_BY,
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
export const CHANGE_COMPARISON_OPERATOR_OPTIONS: OperatorItemType<any>[] = [
    {
        title: messages.comparisonOperatorChangeIncreasesBy.id,
        icon: "gd-icon-increases-by",
        id: COMPARISON_OPERATORS.CHANGE_OPERATOR_INCREASE_BY,
    },
    {
        title: messages.comparisonOperatorChangeDecreasesBy.id,
        icon: "gd-icon-decreases-by",
        id: COMPARISON_OPERATORS.CHANGE_OPERATOR_DECREASE_BY,
    },
    {
        title: messages.comparisonOperatorChangeChangesBy.id,
        icon: "gd-icon-changes-by",
        id: COMPARISON_OPERATORS.CHANGE_OPERATOR_CHANGES_BY,
    },
];
export const DIFFERENCE_COMPARISON_OPERATOR_OPTIONS: OperatorItemType<any>[] = [
    {
        title: messages.comparisonOperatorDifferenceIncreasesBy.id,
        icon: "gd-icon-increases-by",
        id: COMPARISON_OPERATORS.DIFFERENCE_OPERATOR_INCREASE_BY,
    },
    {
        title: messages.comparisonOperatorDifferenceDecreasesBy.id,
        icon: "gd-icon-decreases-by",
        id: COMPARISON_OPERATORS.DIFFERENCE_OPERATOR_DECREASE_BY,
    },
    {
        title: messages.comparisonOperatorDifferenceChangesBy.id,
        icon: "gd-icon-changes-by",
        id: COMPARISON_OPERATORS.DIFFERENCE_OPERATOR_CHANGES_BY,
    },
];

export const OPERATORS = [
    ...COMPARISON_OPERATOR_OPTIONS,
    ...CHANGE_COMPARISON_OPERATOR_OPTIONS,
    ...DIFFERENCE_COMPARISON_OPERATOR_OPTIONS,
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
