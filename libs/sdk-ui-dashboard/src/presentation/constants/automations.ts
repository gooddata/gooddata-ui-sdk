// (C) 2025 GoodData Corporation

import { AutomationColumnDefinition } from "@gooddata/sdk-ui-ext";

export const AUTOMATIONS_COLUMN_CONFIG: Array<AutomationColumnDefinition> = [
    {
        name: "title",
        width: 240,
    },
    {
        name: "dashboard",
        width: 144,
    },
    {
        name: "recipients",
        width: 131,
    },
    {
        name: "lastRun",
        width: 144,
    },
    {
        name: "menu",
    },
];

export const AUTOMATIONS_MAX_HEIGHT = 360;
