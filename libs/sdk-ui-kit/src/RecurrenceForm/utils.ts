// (C) 2024-2025 GoodData Corporation

import { IntlShape } from "react-intl";
import capitalize from "lodash/capitalize.js";
import compact from "lodash/compact.js";
import { WeekStart } from "@gooddata/sdk-model";

import { RecurrenceType } from "./types.js";
import { RECURRENCE_TYPES } from "./constants.js";
import { messages } from "./locales.js";

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function getIntlDayName(intl: IntlShape, startDate: Date | null): string | null {
    if (!startDate) {
        return null;
    }
    return capitalize(intl.formatDate(startDate, { weekday: "long" }));
}

export function getWeekNumber(date: Date | null): number {
    if (!date) {
        return 1;
    }
    return Math.ceil(date.getDate() / 7);
}

export function isLastOccurrenceOfWeekdayInMonth(date: Date | null): boolean {
    if (!date) {
        return false;
    }

    const dayOfWeek = date.getDay();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the current month

    for (let day = date.getDate() + 1; day <= lastDayOfMonth.getDate(); day++) {
        const futureDate = new Date(date.getFullYear(), date.getMonth(), day);
        if (futureDate.getDay() === dayOfWeek) {
            return false; // Found another occurrence of the same weekday
        }
    }

    return true;
}

const getDayOfWeekName = (date: Date | null, weekStart: WeekStart) => {
    if (!date) {
        if (weekStart === "Monday") {
            return weekdays[1];
        }
        return weekdays[0];
    }
    const dayOfWeek = date.getDay();
    return weekdays[dayOfWeek];
};

export const constructCronExpression = (
    date: Date | null,
    recurrenceType: RecurrenceType,
    cronExpression: string,
    weekStart: WeekStart,
) => {
    const hours = date?.getHours();
    const dayOfWeekName = getDayOfWeekName(date, weekStart);
    const weekNumber = getWeekNumber(date);

    switch (recurrenceType) {
        case RECURRENCE_TYPES.HOURLY:
            return `0 0 * ? * *`;
        case RECURRENCE_TYPES.DAILY:
            if (!date) {
                return `0 0 0 ? * *`;
            }
            return `0 0 ${hours} ? * *`;
        case RECURRENCE_TYPES.WEEKLY:
            if (!date) {
                return `0 0 0 ? * ${dayOfWeekName}`;
            }
            return `0 0 ${hours} ? * ${dayOfWeekName}`;
        case RECURRENCE_TYPES.MONTHLY:
            if (!date) {
                return `0 0 0 1 * *`;
            }
            return `0 0 ${hours} ? * ${dayOfWeekName}${
                isLastOccurrenceOfWeekdayInMonth(date) ? "L" : "#" + weekNumber
            }`;
        case RECURRENCE_TYPES.INHERIT:
            return undefined;
        default:
            return cronExpression;
    }
};

const hourlyCronRegex = /^0 0 \* \? \* \*$/; // Every hour
const dailyCronRegex = /^0 0 (\d{1,2}) \? \* \*$/; // Every day at the same hour
const weeklyCronRegex = /^0 0 (\d{1,2}) \? \* (SUN|MON|TUE|WED|THU|FRI|SAT)$/; // Every week at the same day and same hour
const monthlyCronRegex = /^0 0 (\d{1,2}) \? \* (SUN|MON|TUE|WED|THU|FRI|SAT)(#[1-5]|L)$/; // Every month on the nth week day and same hour
const monthlyFirstCronRegex = /^0 0 0 1 \* \*$/; // Every month on the 1 day of week

/**
 * Transforms cron expression to recurrence type
 * @internal
 *
 * @param date - date to compare with cron expression
 * @param cronExpression - cron expression to transform
 * @param allowHourlyRecurrence - whether hourly recurrence is allowed
 * @param allowInheritValue - whether inherit value is allowed
 * @param weekStart - Week start day
 */
export const transformCronExpressionToRecurrenceType = (
    date: Date | null,
    cronExpression: string | undefined,
    allowHourlyRecurrence: boolean,
    allowInheritValue: boolean,
    weekStart: WeekStart,
): RecurrenceType => {
    const hours = date?.getHours();
    const dayOfWeekName = getDayOfWeekName(date, weekStart);
    const weekNumber = isLastOccurrenceOfWeekdayInMonth(date) ? "L" : "#" + getWeekNumber(date);

    switch (true) {
        case allowInheritValue && !cronExpression:
            return RECURRENCE_TYPES.INHERIT;
        case allowHourlyRecurrence && hourlyCronRegex.test(cronExpression):
            return RECURRENCE_TYPES.HOURLY;
        case dailyCronRegex.test(cronExpression): {
            if (!date) {
                return RECURRENCE_TYPES.DAILY;
            }

            const groups = cronExpression.match(dailyCronRegex);
            const h = parseInt(groups[1], 10);
            if (h === hours) {
                return RECURRENCE_TYPES.DAILY;
            }
            return RECURRENCE_TYPES.CRON;
        }
        case weeklyCronRegex.test(cronExpression): {
            if (!date) {
                return RECURRENCE_TYPES.WEEKLY;
            }

            const groups = cronExpression.match(weeklyCronRegex);
            const h = parseInt(groups[1], 10);
            const d = groups[2];

            if (h === hours && d === dayOfWeekName) {
                return RECURRENCE_TYPES.WEEKLY;
            }
            return RECURRENCE_TYPES.CRON;
        }
        case monthlyCronRegex.test(cronExpression): {
            if (!date) {
                return RECURRENCE_TYPES.MONTHLY;
            }

            const groups = cronExpression.match(monthlyCronRegex);
            const h = parseInt(groups[1], 10);
            const d = groups[2];
            const w = groups[3];

            if (h === hours && d === dayOfWeekName && w === weekNumber) {
                return RECURRENCE_TYPES.MONTHLY;
            }
            return RECURRENCE_TYPES.CRON;
        }
        case monthlyFirstCronRegex.test(cronExpression): {
            if (!date) {
                return RECURRENCE_TYPES.MONTHLY;
            }
            return RECURRENCE_TYPES.CRON;
        }
        default:
            return RECURRENCE_TYPES.CRON;
    }
};

export const transformRecurrenceTypeToDescription = (
    intl: IntlShape,
    recurrenceType: RecurrenceType,
    startDate: Date | null,
    weekStart: WeekStart,
): string => {
    // 1/1/2007 is a reference date which has Monday on the first day of the year for simplicity of use
    const empty =
        weekStart === "Monday" ? new Date(2007, 0, 1, 0, 0, 0, 0) : new Date(2007, 0, 7, 0, 0, 0, 0);

    const dayOfWeekName = getIntlDayName(intl, startDate ?? empty);
    const weekNumber = getWeekNumber(startDate ?? empty);

    switch (recurrenceType) {
        case RECURRENCE_TYPES.HOURLY:
            return intl.formatMessage(messages.description_recurrence_hourly);
        case RECURRENCE_TYPES.DAILY:
            return intl.formatMessage(messages.description_recurrence_daily, {
                hour: intl.formatDate(startDate ?? empty, {
                    hour: "numeric",
                    hour12: true,
                }),
            });
        case RECURRENCE_TYPES.WEEKLY:
            if (!startDate) {
                return intl.formatMessage(messages.description_recurrence_weekly_first, {
                    hour: intl.formatDate(empty, {
                        hour: "numeric",
                        hour12: true,
                    }),
                });
            }
            return intl.formatMessage(messages.description_recurrence_weekly, {
                hour: intl.formatDate(startDate, {
                    hour: "numeric",
                    hour12: true,
                }),
                dayOfWeekName,
            });
        case RECURRENCE_TYPES.MONTHLY:
            if (!startDate) {
                return intl.formatMessage(messages.description_recurrence_monthly_first, {
                    hour: intl.formatDate(empty, {
                        hour: "numeric",
                        hour12: true,
                    }),
                });
            }
            return intl.formatMessage(messages.description_recurrence_monthly, {
                hour: intl.formatDate(startDate, {
                    hour: "numeric",
                    hour12: true,
                }),
                dayOfWeekName,
                weekNumber,
            });
        default:
            return "";
    }
};

export const isCronExpressionValid = (
    expression: string | undefined,
    allowHourlyRecurrence: boolean,
): boolean => {
    const invalidExpressions = compact([
        /^\* (\S+) (\S+) (\S+) (\S+) (\S+)$/, // every second
        /^(\S+) \* (\S+) (\S+) (\S+) (\S+)$/, // every minute
        allowHourlyRecurrence ? undefined : /^(\S+) (\S+) \* (\S+) (\S+) (\S+)$/, // every hour
    ]);

    for (const regex of invalidExpressions) {
        if (regex.test(expression)) {
            return false;
        }
    }

    return true;
};
