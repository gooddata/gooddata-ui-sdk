// (C) 2025 GoodData Corporation

import { type AutomationColumnDefinition } from "@gooddata/sdk-ui-ext";

//management dialog
export const AUTOMATIONS_COLUMN_CONFIG: Array<AutomationColumnDefinition> = [
    {
        name: "title",
        width: 285,
    },
    {
        name: "dashboard",
        width: 187,
        minWidth: 187,
    },
    {
        name: "lastRun",
        width: 187,
        minWidth: 187,
    },
    {
        name: "menu",
    },
];

export const AUTOMATIONS_MAX_HEIGHT = 380;

//create dialog
export const AUTOMATION_FILTERS_GROUP_LABEL_ID = "automation-filters-group-label";

export const AUTOMATION_FILTERS_DIALOG_TITLE_ID = "automation-filters-dialog-title";

export const AUTOMATION_FILTERS_DIALOG_ID = "automation-filters-dialog";

export const AUTOMATION_ATTACHMENTS_DIALOG_TITLE_ID = "automation-attachments-dialog-title";

export const AUTOMATION_ATTACHMENTS_GROUP_LABEL_ID = "automation-attachments-group-label";
