// (C) 2024 GoodData Corporation

import { IntlShape } from "react-intl";
import capitalize from "lodash/capitalize.js";
import { RecurrenceType } from "./types.js";
import { RECURRENCE_TYPES } from "./constants.js";

export function getIntlDayName(intl: IntlShape, startDate: Date): string {
    return capitalize(intl.formatDate(startDate, { weekday: "long" }));
}

export function getWeekNumber(date: Date): number {
    return Math.ceil(date.getDate() / 7);
}

export function isLastOccurrenceOfWeekdayInMonth(date: Date): boolean {
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

const getDayOfWeekName = (date: Date) => {
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayOfWeek = date.getDay();
    return weekdays[dayOfWeek];
};

export const constructCronExpression = (
    date: Date,
    recurrenceType: RecurrenceType,
    cronExpression: string,
) => {
    const hours = date.getHours();
    const dayOfWeekName = getDayOfWeekName(date);
    const weekNumber = getWeekNumber(date);

    switch (recurrenceType) {
        case RECURRENCE_TYPES.HOURLY:
            return `0 0 * ? * *`;
        case RECURRENCE_TYPES.DAILY:
            return `0 0 ${hours} ? * *`;
        case RECURRENCE_TYPES.WEEKLY:
            return `0 0 ${hours} ? * ${dayOfWeekName}`;
        case RECURRENCE_TYPES.MONTHLY:
            return `0 0 ${hours} ? * ${dayOfWeekName}#${
                isLastOccurrenceOfWeekdayInMonth(date) ? "L" : weekNumber
            }`;
        default:
            return cronExpression;
    }
};

// eslint-disable-next-line regexp/no-unused-capturing-group
const hourlyCronRegex = /^0 0 \* \? \* \*$/; // Every hour
// eslint-disable-next-line regexp/no-unused-capturing-group
const dailyCronRegex = /^0 0 (\d{1,2}) \? \* \*$/; // Every day at the same hour
// eslint-disable-next-line regexp/no-unused-capturing-group
const weeklyCronRegex = /^0 0 (\d{1,2}) \? \* (SUN|MON|TUE|WED|THU|FRI|SAT)$/; // Every week at the same day and same hour
// eslint-disable-next-line regexp/no-unused-capturing-group
const monthlyCronRegex = /^0 0 (\d{1,2}) \? \* (SUN|MON|TUE|WED|THU|FRI|SAT)(#[1-5]|#L)$/; // Every month on the nth week day and same hour

export const transformCronExpressionToRecurrenceType = (
    cronExpression: string,
    allowHourlyRecurrence: boolean,
): RecurrenceType => {
    switch (true) {
        case allowHourlyRecurrence && hourlyCronRegex.test(cronExpression):
            return RECURRENCE_TYPES.HOURLY;
        case dailyCronRegex.test(cronExpression):
            return RECURRENCE_TYPES.DAILY;
        case weeklyCronRegex.test(cronExpression):
            return RECURRENCE_TYPES.WEEKLY;
        case monthlyCronRegex.test(cronExpression):
            return RECURRENCE_TYPES.MONTHLY;
        default:
            return RECURRENCE_TYPES.CRON;
    }
};
