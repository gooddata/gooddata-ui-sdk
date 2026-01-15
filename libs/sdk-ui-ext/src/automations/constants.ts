// (C) 2025-2026 GoodData Corporation

import { type IUiIconProps } from "@gooddata/sdk-ui-kit";

import {
    type AutomationColumnDefinitions,
    type AutomationsAvailableFilters,
    type AutomationsScope,
    type CellValueType,
    type IAutomationActionsState,
    type IAutomationsState,
} from "./types.js";

export const COMPARISON_OPERATOR_LESS_THAN = "LESS_THAN";
export const COMPARISON_OPERATOR_LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO";
export const COMPARISON_OPERATOR_GREATER_THAN = "GREATER_THAN";
export const COMPARISON_OPERATOR_GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO";

export const RELATIVE_OPERATOR_INCREASE_BY = "INCREASES_BY";
export const RELATIVE_OPERATOR_DECREASE_BY = "DECREASES_BY";
export const RELATIVE_OPERATOR_CHANGES_BY = "CHANGES_BY";

export const ARITHMETIC_OPERATOR_DIFFERENCE = "DIFFERENCE";
export const ARITHMETIC_OPERATOR_CHANGE = "CHANGE";

export const ANOMALY_DETECTION = "ANOMALY_DETECTION";

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

/**
 * @internal
 */
export const AI_OPERATOR = "AI";

/**
 * @internal
 */
export const AI_OPERATORS = {
    ANOMALY_DETECTION,
} as const;

export const DEFAULT_MAX_HEIGHT = 500;
export const DEFAULT_PAGE_SIZE = 30;

export const DATE_LOCALE = "en-US";
export const DATE_FORMAT_HYPHEN = "yyyy-MM-DD HH:mm";
export const DATE_FORMAT_SLASH = "MM/DD/yyyy HH:mm";

const DEFAULT_GENERAL_COLUMN_WIDTH = 225;
const DEFAULT_LARGE_COLUMN_WIDTH = 270;

/**
 * @internal
 */
export const DEFAULT_COLUMN_WIDTHS = {
    ID: 100,
    NAME: 280,
    DASHBOARD: DEFAULT_LARGE_COLUMN_WIDTH,
    WORKSPACE: DEFAULT_LARGE_COLUMN_WIDTH,
    RECIPIENTS: DEFAULT_GENERAL_COLUMN_WIDTH,
    LAST_SENT: DEFAULT_GENERAL_COLUMN_WIDTH,
    STATE: DEFAULT_GENERAL_COLUMN_WIDTH,
    LAST_RUN_STATUS: DEFAULT_GENERAL_COLUMN_WIDTH,
    CREATED_BY: DEFAULT_GENERAL_COLUMN_WIDTH,
    CREATED_AT: DEFAULT_GENERAL_COLUMN_WIDTH,
    NOTIFICATION_CHANNEL: DEFAULT_GENERAL_COLUMN_WIDTH,
    WIDGET: DEFAULT_GENERAL_COLUMN_WIDTH,
    ATTACHMENTS: DEFAULT_GENERAL_COLUMN_WIDTH,
    NEXT_RUN: DEFAULT_GENERAL_COLUMN_WIDTH,
} as const;

/**
 * @internal
 */
export const EMPTY_CELL_VALUES: Record<CellValueType, string> = {
    text: "",
    date: "",
    number: "",
    "slash-date": "",
} as const;

export const AUTOMATION_FILTER_EXCLUDE_THRESHOLD = 10;

export const AUTOMATIONS_ID_PREFIX = "gd-automations-";

// Single item confirm dialog IDs
export const DELETE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}delete-confirm-dialog`;
export const UNSUBSCRIBE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}unsubscribe-confirm-dialog`;
export const PAUSE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}pause-confirm-dialog`;
export const RESUME_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}resume-confirm-dialog`;

// Bulk action confirm dialog IDs
export const BULK_DELETE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}bulk-delete-confirm-dialog`;
export const BULK_UNSUBSCRIBE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}bulk-unsubscribe-confirm-dialog`;
export const BULK_PAUSE_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}bulk-pause-confirm-dialog`;
export const BULK_RESUME_CONFIRM_DIALOG_ID = `${AUTOMATIONS_ID_PREFIX}bulk-resume-confirm-dialog`;

export const AUTOMATIONS_SMALL_LAYOUT_SEARCH_THRESHOLD = 7;
export const AUTOMATIONS_SMALL_LAYOUT_BULK_ACTIONS_THRESHOLD = 1;

export const AutomationsDefaultState: IAutomationsState = {
    automations: [],
    totalItemsCount: 0,
    previousAutomations: [],
    previousTotalItemsCount: 0,
    hasNextPage: true,
    page: 0,
    search: "",
    selectedIds: new Set(),
    sortBy: "title",
    sortDirection: "asc",
    invalidationId: 0,
    isFiltersTooLarge: false,
    isChainedActionInProgress: false,
};

export const AutomationActionsDefaultState: IAutomationActionsState = {
    deletedAutomation: undefined,
    bulkDeletedAutomations: [],
    unsubscribedAutomation: undefined,
    bulkUnsubscribedAutomations: [],
    pausedAutomation: undefined,
    bulkPausedAutomations: [],
    resumedAutomation: undefined,
    bulkResumedAutomations: [],
};

export const defaultAvailableFilters: Record<AutomationsScope, AutomationsAvailableFilters> = {
    workspace: ["dashboard", "recipients", "status"],
    organization: ["workspace", "recipients", "status"],
};

export const defaultColumnDefinitions: Record<AutomationsScope, AutomationColumnDefinitions> = {
    workspace: [
        { name: "title" },
        { name: "dashboard" },
        { name: "recipients" },
        { name: "lastRun" },
        { name: "menu" },
    ],
    organization: [
        { name: "title" },
        { name: "workspace" },
        { name: "recipients" },
        { name: "lastRun" },
        { name: "menu" },
    ],
};

export const getAutomationActionsEmptyState = () => ({ ...AutomationActionsDefaultState });

const titleIconProps = {
    color: "complementary-6",
    size: 14,
    backgroundSize: 27,
    backgroundColor: "complementary-2",
    backgroundType: "fill",
} as const;

export const AUTOMATION_ICON_CONFIGS: Record<string, IUiIconProps> = {
    schedule: {
        type: "clock",
        ...titleIconProps,
    },
    alert: {
        type: "alert",
        ...titleIconProps,
    },
    schedulePAUSED: {
        type: "clockPaused",
        ...titleIconProps,
    },
    alertPAUSED: {
        type: "alertPaused",
        ...titleIconProps,
    },
    automationDetails: {
        type: "question",
        color: "complementary-6",
        size: 16,
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
