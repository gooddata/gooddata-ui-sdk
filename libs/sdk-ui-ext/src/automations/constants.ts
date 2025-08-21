// (C) 2025 GoodData Corporation

import { UiIconProps } from "@gooddata/sdk-ui-kit";

import { CellValueType, IAutomationsState } from "./types.js";

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
export const DEFAULT_PAGE_SIZE = 30;

export const DATE_LOCALE = "en-US";
export const DATE_FORMAT = "yyyy-MM-DD HH:mm";

export const ALL_DASHBOARDS_FILTER_VALUE = "__ALL_DASHBOARDS__";
export const ALL_RECIPIENTS_FILTER_VALUE = "__ALL_RECIPIENTS__";
export const ALL_CREATED_BY_FILTER_VALUE = "__ALL_CREATED_BY__";
export const ALL_STATUS_FILTER_VALUE = "__ALL_STATUS__";

const DEFAULT_GENERAL_COLUMN_WIDTH = 225;

/**
 * @internal
 */
export const DEFAULT_COLUMN_WIDTHS = {
    ID: 100,
    NAME: 280,
    DASHBOARD: 250,
    RECIPIENTS: DEFAULT_GENERAL_COLUMN_WIDTH,
    LAST_SENT: DEFAULT_GENERAL_COLUMN_WIDTH,
    STATE: DEFAULT_GENERAL_COLUMN_WIDTH,
    CREATED_BY: DEFAULT_GENERAL_COLUMN_WIDTH,
    CREATED_AT: DEFAULT_GENERAL_COLUMN_WIDTH,
    NOTIFICATION_CHANNEL: DEFAULT_GENERAL_COLUMN_WIDTH,
    WIDGET: DEFAULT_GENERAL_COLUMN_WIDTH,
    ATTACHMENTS: DEFAULT_GENERAL_COLUMN_WIDTH,
} as const;

/**
 * @internal
 */
export const EMPTY_CELL_VALUES: Record<CellValueType, string> = {
    text: "",
    date: "",
    number: "",
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
    isChainedActionInProgress: false,
};

export const AUTOMATION_ICON_CONFIGS: Record<string, UiIconProps> = {
    schedule: {
        type: "clock",
        color: "complementary-6",
        size: 14,
        backgroundSize: 27,
        backgroundColor: "complementary-2",
        backgroundType: "fill",
    },
    alert: {
        type: "alert",
        color: "complementary-6",
        size: 14,
        backgroundSize: 27,
        backgroundColor: "complementary-2",
        backgroundType: "fill",
    },
    SUCCESS: {
        type: "checkCircle",
        color: "success",
        size: 14,
    },
    FAILED: {
        type: "crossCircle",
        color: "error",
        size: 14,
    },
} as const;
