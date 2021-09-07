// (C) 2020-2021 GoodData Corporation

export const PLATFORM_DATE_FORMAT = "yyyy-MM-dd";

export const DEFAULT_DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
    },
    {
        align: "tl bl",
    },
];
export const DEFAULT_DROPDOWN_ZINDEX = 5001;
export const DEFAULT_REPEAT_PERIOD = 1;

export const REPEAT_TYPES = {
    WEEKLY: "weekly",
    DAILY: "daily",
    MONTHLY: "monthly",
    CUSTOM: "custom",
};

export const REPEAT_FREQUENCIES = {
    DAY: "day",
    MONTH: "month",
    WEEK: "week",
};
export const FREQUENCY_TYPE = [REPEAT_FREQUENCIES.DAY, REPEAT_FREQUENCIES.WEEK, REPEAT_FREQUENCIES.MONTH];

export const REPEAT_EXECUTE_ON = {
    DAY_OF_MONTH: "dayOfMonth",
    DAY_OF_WEEK: "dayOfWeek",
};
