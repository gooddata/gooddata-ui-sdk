// (C) 2024 GoodData Corporation

import { describe, it, expect } from "vitest";
import {
    constructCronExpression,
    isLastOccurrenceOfWeekdayInMonth,
    transformCronExpressionToRecurrenceType,
} from "./utils.js";

const sampleCronExp = "0 0 1 ? * 2";
const sampleDate = new Date("2023-04-05T14:34:21");
const sampleDate2 = new Date("2023-04-13T15:34:21");
const sampleDate3 = new Date("2023-04-18T16:34:21");
const sampleDate4 = new Date("2023-03-24T12:34:21");
const sampleDate5 = new Date("2023-04-24T17:34:21");
const sampleDate6 = new Date("2023-04-30T18:34:21");

describe("isLastOccurrenceOfWeekdayInMonth", () => {
    it.each([
        [true, new Date("2023-04-30"), "5th Sunday of April 2023, last because April 2023 has 5 Sundays"],
        [
            false,
            new Date("2023-04-02"),
            "1st Sunday of April 2023, not last because April 2023 has 5 Sundays",
        ],
        [true, new Date("2023-07-28"), "4th Friday of July 2023, last because July 2023 has 4 Fridays"],
        [
            true,
            new Date("2024-02-25"),
            "4th Sunday of February 2024, last because February 2024 has 4 Sundays (leap year)",
        ],
        [true, new Date("2023-05-25"), "4th Thursday of May 2023, last because May 2023 has 4 Thursdays"],
        [true, new Date("2023-05-31"), "5th Wednesday of May 2023, last because May 2023 has 5 Wednesdays"],
        [
            true,
            new Date("2023-12-28"),
            "4th Thursday of December 2023, last because December 2023 has 4 Thursdays",
        ],
        [
            true,
            new Date("2023-12-31"),
            "5th Sunday of December 2023, last because December 2023 has 5 Sundays",
        ],
        [
            true,
            new Date("2023-09-28"),
            "4th Thursday of September 2023, last because September 2023 has 4 Thursdays",
        ],
        [
            false,
            new Date("2023-09-21"),
            "3rd Thursday of September 2023, not last because September 2023 has 4 Thursdays",
        ],
        [
            true,
            new Date("2023-02-22"),
            "4th Wednesday of February 2023, last because February 2023 has 4 Wednesdays",
        ],
        [
            false,
            new Date("2023-02-15"),
            "3rd Wednesday of February 2023, not last because February 2023 has 4 Wednesdays",
        ],
    ])("should return %s for %s", (expectedResult, date) => {
        expect(isLastOccurrenceOfWeekdayInMonth(date)).toBe(expectedResult);
    });
});

describe("constructCronExpression", () => {
    it.each([
        ["hourly", sampleDate, sampleCronExp, "0 0 * ? * *", "every hour"],
        ["daily", sampleDate, sampleCronExp, "0 0 14 ? * *", "every day at the same time"],
        ["weekly", sampleDate, sampleCronExp, "0 0 14 ? * WED", "every week at the same day and time"],
        ["monthly", sampleDate, sampleCronExp, "0 0 14 ? * WED#1", "every month on the first wednesday"],
        ["monthly", sampleDate2, sampleCronExp, "0 0 15 ? * THU#2", "every month on the second thursday"],
        ["monthly", sampleDate3, sampleCronExp, "0 0 16 ? * TUE#3", "every month on the third tuesday"],
        ["monthly", sampleDate4, sampleCronExp, "0 0 12 ? * FRI#4", "every month on the fourth friday"],
        [
            "monthly",
            sampleDate5,
            sampleCronExp,
            "0 0 17 ? * MON#L",
            "every month on the last (fourth) monday",
        ],
        ["monthly", sampleDate6, sampleCronExp, "0 0 18 ? * SUN#L", "every month on the last (fifth) sunday"],
        ["cron", sampleDate, sampleCronExp, sampleCronExp, "provided cron expression"],
    ])(
        "should transform date and recurrence type to %s expression",
        (recurrenceType, date, defaultCronExpression, expectedCronExpression, _description) => {
            expect(constructCronExpression(date, recurrenceType, defaultCronExpression)).toEqual(
                expectedCronExpression,
            );
        },
    );
});

describe("transformCronExpressionToRecurrenceType", () => {
    it.each([
        ["0 0 * ? * *", "hourly"],
        ["0 0 1 ? * *", "daily"],
        ["0 0 9 ? * *", "daily"],
        ["0 0 18 ? * *", "daily"],
        ["0 0 1 ? * SUN", "weekly"],
        ["0 0 9 ? * MON", "weekly"],
        ["0 0 12 ? * TUE", "weekly"],
        ["0 0 18 ? * FRI", "weekly"],
        ["0 0 23 ? * SAT", "weekly"],
        ["0 0 15 ? * MON#1", "monthly", "every first monday"],
        ["0 0 15 ? * FRI#1", "monthly", "every first friday"],
        ["0 0 15 ? * TUE#2", "monthly", "every second tuesday"],
        ["0 0 15 ? * WED#3", "monthly", "every third wednesday"],
        ["0 0 15 ? * THU#4", "monthly", "every fourth thursday"],
        ["0 0 15 ? * FRI#5", "monthly", "every fifth friday"],
        ["0 0 15 ? * FRI#L", "monthly", "every last (fifth) friday"],
        ["* * * * * *", "cron"],
        ["* * * ? * *", "cron"],
        ["1 1 1 1 1 1", "cron"],
        ["1 1 1 ? 1 1", "cron"],
        ["0 0 1 ? * 5", "cron"],
        ["0 0 1 ? JAN SUN", "cron"],
        ["0 0 1 ? * 1-3", "cron"],
        ["0 0 1 ? * 1,2", "cron"],
        ["0 0 1 ? * 1/2", "cron"],
    ])("should correctly identify %s as %s", (cronExpression, expected) => {
        expect(transformCronExpressionToRecurrenceType(cronExpression)).toEqual(expected);
    });
});
