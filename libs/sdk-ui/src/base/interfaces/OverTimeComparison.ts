// (C) 2007-2020 GoodData Corporation
export const OverTimeComparisonTypes = {
    SAME_PERIOD_PREVIOUS_YEAR: "same_period_previous_year" as const,
    PREVIOUS_PERIOD: "previous_period" as const,
    NOTHING: "nothing" as const,
};

export type OverTimeComparisonType = "same_period_previous_year" | "previous_period" | "nothing";
