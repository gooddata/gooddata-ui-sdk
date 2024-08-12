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

describe("constructCronExpression with date", () => {
    it.each([
        ["hourly", sampleDate, sampleCronExp, "0 0 * ? * *", "every hour"],
        ["daily", sampleDate, sampleCronExp, "0 0 14 ? * *", "every day at the same time"],
        ["weekly", sampleDate, sampleCronExp, "0 0 14 ? * WED", "every week at the same day and time"],
        ["monthly", sampleDate, sampleCronExp, "0 0 14 ? * WED#1", "every month on the first wednesday"],
        ["monthly", sampleDate2, sampleCronExp, "0 0 15 ? * THU#2", "every month on the second thursday"],
        ["monthly", sampleDate3, sampleCronExp, "0 0 16 ? * TUE#3", "every month on the third tuesday"],
        ["monthly", sampleDate4, sampleCronExp, "0 0 12 ? * FRI#4", "every month on the fourth friday"],
        ["monthly", sampleDate5, sampleCronExp, "0 0 17 ? * MONL", "every month on the last (fourth) monday"],
        ["monthly", sampleDate6, sampleCronExp, "0 0 18 ? * SUNL", "every month on the last (fifth) sunday"],
        ["cron", sampleDate, sampleCronExp, sampleCronExp, "provided cron expression"],
    ])(
        "should transform date and recurrence type to %s expression",
        (recurrenceType, date, defaultCronExpression, expectedCronExpression, _description) => {
            expect(constructCronExpression(date, recurrenceType, defaultCronExpression, "Monday")).toEqual(
                expectedCronExpression,
            );
        },
    );
});

describe("constructCronExpression without date, default Monday", () => {
    it.each([
        ["hourly", sampleCronExp, "0 0 * ? * *", "every hour"],
        ["daily", sampleCronExp, "0 0 0 ? * *", "every day at the same time"],
        ["weekly", sampleCronExp, "0 0 0 ? * MON", "every week at the same day and time"],
        ["monthly", sampleCronExp, "0 0 0 1 * *", "every month at first day"],
        ["cron", sampleCronExp, sampleCronExp, "provided cron expression"],
    ])(
        "should transform date and recurrence type to %s expression",
        (recurrenceType, defaultCronExpression, expectedCronExpression, _description) => {
            expect(constructCronExpression(null, recurrenceType, defaultCronExpression, "Monday")).toEqual(
                expectedCronExpression,
            );
        },
    );
});

describe("constructCronExpression without date, default Sunday", () => {
    it.each([
        ["hourly", sampleCronExp, "0 0 * ? * *", "every hour"],
        ["daily", sampleCronExp, "0 0 0 ? * *", "every day at the same time"],
        ["weekly", sampleCronExp, "0 0 0 ? * SUN", "every week at the same day and time"],
        ["monthly", sampleCronExp, "0 0 0 1 * *", "every month at first day"],
        ["cron", sampleCronExp, sampleCronExp, "provided cron expression"],
    ])(
        "should transform date and recurrence type to %s expression",
        (recurrenceType, defaultCronExpression, expectedCronExpression, _description) => {
            expect(constructCronExpression(null, recurrenceType, defaultCronExpression, "Sunday")).toEqual(
                expectedCronExpression,
            );
        },
    );
});

describe("transformCronExpressionToRecurrenceType with date", () => {
    const universal = new Date();
    const D2024_01_01_01 = new Date(2024, 0, 1, 1, 0, 0);
    const D2024_01_01_09 = new Date(2024, 0, 1, 9, 0, 0);
    const D2024_01_01_18 = new Date(2024, 0, 1, 18, 0, 0);
    const D2024_01_07_01 = new Date(2024, 0, 7, 1, 0, 0);
    const D2024_01_08_09 = new Date(2024, 0, 8, 9, 0, 0);
    const D2024_01_09_12 = new Date(2024, 0, 9, 12, 0, 0);
    const D2024_01_12_18 = new Date(2024, 0, 12, 18, 0, 0);
    const D2024_01_13_23 = new Date(2024, 0, 13, 23, 0, 0);

    const D2024_01_01_15 = new Date(2024, 0, 1, 15, 0, 0);
    const D2024_01_05_15 = new Date(2024, 0, 5, 15, 0, 0);
    const D2024_01_09_15 = new Date(2024, 0, 9, 15, 0, 0);
    const D2024_01_17_15 = new Date(2024, 0, 17, 15, 0, 0);
    const D2024_01_25_15 = new Date(2024, 0, 25, 15, 0, 0);

    it.each([
        ["0 0 * ? * *", true, universal, "hourly"],
        ["0 0 * ? * *", false, universal, "cron"],
        ["0 0 1 ? * *", true, D2024_01_01_01, "daily"],
        ["0 0 9 ? * *", true, D2024_01_01_09, "daily"],
        ["0 0 18 ? * *", true, D2024_01_01_18, "daily"],
        ["0 0 10 ? * *", true, D2024_01_01_18, "cron"],
        ["0 0 1 ? * SUN", true, D2024_01_07_01, "weekly"],
        ["0 0 9 ? * MON", true, D2024_01_08_09, "weekly"],
        ["0 0 12 ? * TUE", true, D2024_01_09_12, "weekly"],
        ["0 0 18 ? * FRI", true, D2024_01_12_18, "weekly"],
        ["0 0 23 ? * SAT", true, D2024_01_13_23, "weekly"],
        ["0 0 23 ? * FRI", true, D2024_01_13_23, "cron"],
        ["0 0 10 ? * SAT", true, D2024_01_13_23, "cron"],
        ["0 0 15 ? * MON#1", true, D2024_01_01_15, "monthly", "every first monday"],
        ["0 0 15 ? * FRI#1", true, D2024_01_05_15, "monthly", "every first friday"],
        ["0 0 15 ? * TUE#2", true, D2024_01_09_15, "monthly", "every second tuesday"],
        ["0 0 15 ? * WED#3", true, D2024_01_17_15, "monthly", "every third wednesday"],
        ["0 0 15 ? * THUL", true, D2024_01_25_15, "monthly", "every last (fourth) thursday"],
        ["0 0 15 ? * THU#5", true, D2024_01_25_15, "cron"],
        ["0 0 8 ? * TUE#2", true, D2024_01_09_15, "cron"],
        ["* * * * * *", true, universal, "cron"],
        ["* * * ? * *", true, universal, "cron"],
        ["1 1 1 1 1 1", true, universal, "cron"],
        ["1 1 1 ? 1 1", true, universal, "cron"],
        ["0 0 1 ? * 5", true, universal, "cron"],
        ["0 0 1 ? JAN SUN", true, universal, "cron"],
        ["0 0 1 ? * 1-3", true, universal, "cron"],
        ["0 0 1 ? * 1,2", true, universal, "cron"],
        ["0 0 1 ? * 1/2", true, universal, "cron"],
        ["0 0 0 1 * *", true, universal, "cron"],
    ])(
        "should correctly identify %s with hourly %s and date %s as %s",
        (cronExpression, allowHourly, date, expected) => {
            expect(
                transformCronExpressionToRecurrenceType(date, cronExpression, allowHourly, "Monday"),
            ).toEqual(expected);
        },
    );
});

describe("transformCronExpressionToRecurrenceType without date, default Monday", () => {
    it.each([
        ["0 0 * ? * *", true, "hourly"],
        ["0 0 * ? * *", false, "cron"],
        ["0 0 1 ? * *", true, "daily"],
        ["0 0 9 ? * *", true, "daily"],
        ["0 0 18 ? * *", true, "daily"],
        ["0 0 10 ? * *", true, "daily"],
        ["0 0 1 ? * SUN", true, "weekly"],
        ["0 0 9 ? * MON", true, "weekly"],
        ["0 0 12 ? * TUE", true, "weekly"],
        ["0 0 18 ? * FRI", true, "weekly"],
        ["0 0 23 ? * SAT", true, "weekly"],
        ["0 0 23 ? * FRI", true, "weekly"],
        ["0 0 10 ? * SAT", true, "weekly"],
        ["0 0 15 ? * MON#1", true, "monthly", "every first monday"],
        ["0 0 15 ? * FRI#1", true, "monthly", "every first friday"],
        ["0 0 15 ? * TUE#2", true, "monthly", "every second tuesday"],
        ["0 0 15 ? * WED#3", true, "monthly", "every third wednesday"],
        ["0 0 15 ? * THUL", true, "monthly", "every last (fourth) thursday"],
        ["0 0 15 ? * THU#5", true, "monthly"],
        ["0 0 8 ? * TUE#2", true, "monthly"],
        ["0 0 0 1 * *", true, "monthly"],
        ["* * * * * *", true, "cron"],
        ["* * * ? * *", true, "cron"],
        ["1 1 1 1 1 1", true, "cron"],
        ["1 1 1 ? 1 1", true, "cron"],
        ["0 0 1 ? * 5", true, "cron"],
        ["0 0 1 ? JAN SUN", true, "cron"],
        ["0 0 1 ? * 1-3", true, "cron"],
        ["0 0 1 ? * 1,2", true, "cron"],
        ["0 0 1 ? * 1/2", true, "cron"],
    ])("should correctly identify %s with hourly %s as %s", (cronExpression, allowHourly, expected) => {
        expect(transformCronExpressionToRecurrenceType(null, cronExpression, allowHourly, "Monday")).toEqual(
            expected,
        );
    });
});
