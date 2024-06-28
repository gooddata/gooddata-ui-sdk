// (C) 2024 GoodData Corporation

export const TIME_ANCHOR = 60; // 1 hour granularity for time picker
export const MAX_VISIBLE_TIME_ITEMS_COUNT = 5;

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
export const DEFAULT_WEEK_START = "Monday";
export const DEFAULT_TIMEZONE = "Europe/Prague";
export const DEFAULT_TIME_FORMAT = "HH:mm";

export const DEFAULT_DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
    },
    {
        align: "tl bl",
    },
];
export const DEFAULT_DROPDOWN_ZINDEX = 5001;
export const DEFAULT_DROPDOWN_WIDTH = 199;

export const RECURRENCE_TYPES = {
    HOURLY: "hourly",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    CRON: "cron",
};

export const RECURRENCE_TYPES_WITHOUT_HOURS = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    CRON: "cron",
};
