// (C) 2025 GoodData Corporation

import { WeekStart } from "@gooddata/sdk-model";
import { RECURRENCE_TYPES } from "../constants.js";
import { RecurrenceType } from "../types.js";

// Hourly patterns
const HOURLY_PATTERNS = [
    /^0 0 \* \? \* \*$/, // Every hour at minute 0
];

// Daily patterns
const DAILY_PATTERNS = [
    /^0 0 0 \? \* \*$/, // Every day at midnight
];

// Helper function to get weekly patterns based on week start
const getWeeklyPatterns = (weekStart: WeekStart): RegExp[] => {
    // WeekStart.Sunday = 0, WeekStart.Monday = 1
    const firstDayOfWeek = weekStart === "Sunday" ? 0 : 1;
    const firstDayOfWeekString = weekStart === "Sunday" ? "SUN" : "MON";

    return [
        // Numeric patterns
        new RegExp(`^0 0 0 \\? \\* ${firstDayOfWeek}$`), // First day of week at midnight
        // String patterns
        new RegExp(`^0 0 0 \\? \\* ${firstDayOfWeekString}$`), // First day of week at midnight (string format)
    ];
};

// Monthly patterns
const MONTHLY_PATTERNS = [
    /^0 0 0 1 \* \*$/, // First day of every month at midnight
];

const getDefaultCronExpression = (allowHourlyRecurrence: boolean) => {
    if (allowHourlyRecurrence) {
        return `0 0 * ? * *`; // Every hour at minute 0
    }

    return `0 0 0 ? * *`; // Every day at midnight
};

/**
 * Simple recurrence type mapping function.
 *
 * Maps cron expressions to recurrence types based on simple fixed patterns.
 * Any cron expression that doesn't match the standard patterns will be classified as CRON (custom).
 * We are deliberately using just a few simple patterns to avoid complexity.
 * Users can still use CRON for any customization.
 *
 * @internal
 */
export const simpleRecurrenceTypeMappingFn = (
    _date?: Date | null,
    cronExpression?: string,
    allowHourlyRecurrence?: boolean,
    _showInheritValue?: boolean,
    weekStart?: WeekStart,
): RecurrenceType => {
    const normalizedCron = cronExpression?.trim() ?? getDefaultCronExpression(allowHourlyRecurrence);
    // Hourly patterns (only if allowed)
    if (allowHourlyRecurrence && HOURLY_PATTERNS.some((pattern) => pattern.test(normalizedCron))) {
        return RECURRENCE_TYPES.HOURLY;
    }

    // Daily patterns
    if (DAILY_PATTERNS.some((pattern) => pattern.test(normalizedCron))) {
        return RECURRENCE_TYPES.DAILY;
    }

    // Weekly patterns (only first day of week based on weekStart)
    const weeklyPatterns = getWeeklyPatterns(weekStart);
    if (weeklyPatterns.some((pattern) => pattern.test(normalizedCron))) {
        return RECURRENCE_TYPES.WEEKLY;
    }

    // Monthly patterns
    if (MONTHLY_PATTERNS.some((pattern) => pattern.test(normalizedCron))) {
        return RECURRENCE_TYPES.MONTHLY;
    }

    // If no standard pattern matches, classify as custom cron
    return RECURRENCE_TYPES.CRON;
};
