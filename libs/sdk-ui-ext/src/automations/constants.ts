// (C) 2025 GoodData Corporation

import { IAutomationsState } from "./types.js";

export const COMPARISON_OPERATOR_LESS_THAN = "LESS_THAN";
export const COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO";
export const COMPARISON_OPERATOR_GREATER_THAN = "GREATER_THAN";
export const COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO";

export const RELATIVE_OPERATOR_INCREASE_BY = "INCREASES_BY";
export const RELATIVE_OPERATOR_DECREASE_BY = "DECREASES_BY";
export const RELATIVE_OPERATOR_CHANGES_BY = "CHANGES_BY";

export const ARITHMETIC_OPERATOR_DIFFERENCE = "DIFFERENCE";
export const ARITHMETIC_OPERATOR_CHANGE = "CHANGE";

/**
 * @internal
 */
export const COMPARISON_OPERATORS = {
    COMPARISON_OPERATOR_LESS_THAN,
    COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO,
    COMPARISON_OPERATOR_GREATER_THAN,
    COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO,
} as const;

/**
 * @internal
 */
export const RELATIVE_OPERATORS = {
    RELATIVE_OPERATOR_INCREASE_BY,
    RELATIVE_OPERATOR_DECREASE_BY,
    RELATIVE_OPERATOR_CHANGES_BY,
} as const;

/**
 * @internal
 */
export const ARITHMETIC_OPERATORS = {
    ARITHMETIC_OPERATOR_DIFFERENCE,
    ARITHMETIC_OPERATOR_CHANGE,
} as const;

export const DEFAULT_MAX_HEIGHT = 500;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * @internal
 */
export const DEFAULT_COLUMN_WIDTHS = {
    ID: 100,
    NAME: 280,
    DASHBOARD: 250,
    RECIPIENTS: 225,
    LAST_SENT: 225,
    STATE: 225,
    CREATED_BY: 225,
    CREATED_AT: 225,
    NOTIFICATION_CHANNEL: 225,
} as const;

export const AutomationsDefaultState: IAutomationsState = {
    automations: [],
    totalItemsCount: 0,
    hasNextPage: true,
    page: 0,
    search: "",
    selectedIds: [],
    sortBy: "title",
    sortDirection: "asc",
    invalidationId: 0,
};
