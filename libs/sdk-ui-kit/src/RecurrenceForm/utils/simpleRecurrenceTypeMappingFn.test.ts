// (C) 2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import { simpleRecurrenceTypeMappingFn } from "./simpleRecurrenceTypeMappingFn.js";
import { RECURRENCE_TYPES } from "../constants.js";

describe("simpleRecurrenceTypeMappingFn", () => {
    it.each([
        // Basic hourly patterns
        ["0 0 * ? * *", true, "Monday", RECURRENCE_TYPES.HOURLY, "hourly pattern when allowed"],
        ["0 0 * ? * *", false, "Monday", RECURRENCE_TYPES.CRON, "hourly pattern when not allowed"],
        [undefined, true, "Monday", RECURRENCE_TYPES.HOURLY, "default hourly when allowed and no cron"],

        // Basic daily patterns
        ["0 0 0 ? * *", false, "Monday", RECURRENCE_TYPES.DAILY, "daily pattern"],
        ["0 0 0 ? * *", true, "Monday", RECURRENCE_TYPES.DAILY, "daily pattern with hourly allowed"],
        [
            undefined,
            false,
            "Monday",
            RECURRENCE_TYPES.DAILY,
            "default daily when hourly not allowed and no cron",
        ],

        // Weekly patterns - Monday week start
        ["0 0 0 ? * 1", false, "Monday", RECURRENCE_TYPES.WEEKLY, "Monday numeric weekly"],
        ["0 0 0 ? * MON", false, "Monday", RECURRENCE_TYPES.WEEKLY, "Monday string weekly"],
        ["0 0 0 ? * 0", false, "Monday", RECURRENCE_TYPES.CRON, "Sunday with Monday week start"],
        ["0 0 0 ? * SUN", false, "Monday", RECURRENCE_TYPES.CRON, "Sunday string with Monday week start"],
        ["0 0 0 ? * 2", false, "Monday", RECURRENCE_TYPES.CRON, "Tuesday with Monday week start"],

        // Weekly patterns - Sunday week start
        ["0 0 0 ? * 0", false, "Sunday", RECURRENCE_TYPES.WEEKLY, "Sunday numeric weekly"],
        ["0 0 0 ? * SUN", false, "Sunday", RECURRENCE_TYPES.WEEKLY, "Sunday string weekly"],
        ["0 0 0 ? * 1", false, "Sunday", RECURRENCE_TYPES.CRON, "Monday with Sunday week start"],
        ["0 0 0 ? * MON", false, "Sunday", RECURRENCE_TYPES.CRON, "Monday string with Sunday week start"],

        // Weekly patterns - undefined week start (defaults to Monday)
        [
            "0 0 0 ? * 1",
            false,
            undefined,
            RECURRENCE_TYPES.WEEKLY,
            "Monday numeric with undefined week start",
        ],
        [
            "0 0 0 ? * MON",
            false,
            undefined,
            RECURRENCE_TYPES.WEEKLY,
            "Monday string with undefined week start",
        ],

        // Monthly patterns
        ["0 0 0 1 * *", false, "Monday", RECURRENCE_TYPES.MONTHLY, "monthly pattern"],
        ["0 0 0 1 * *", true, "Monday", RECURRENCE_TYPES.MONTHLY, "monthly pattern with hourly allowed"],

        // Custom/complex cron patterns
        ["0 30 10 ? * MON-FRI", false, "Monday", RECURRENCE_TYPES.CRON, "complex business days pattern"],
        ["0 15 8 ? * TUE", false, "Monday", RECURRENCE_TYPES.CRON, "Tuesday at specific time"],
        ["0 0 8 ? * MON#1", false, "Monday", RECURRENCE_TYPES.CRON, "first Monday of month pattern"],
        ["0 30 14 ? * MON-FRI", false, "Monday", RECURRENCE_TYPES.CRON, "complex pattern"],

        // Invalid/edge cases
        ["invalid cron", false, "Monday", RECURRENCE_TYPES.CRON, "invalid cron expression"],
        ["", false, "Monday", RECURRENCE_TYPES.CRON, "empty string"],
        ["   ", false, "Monday", RECURRENCE_TYPES.CRON, "whitespace-only string"],
        [null, false, "Monday", RECURRENCE_TYPES.DAILY, "null cron expression"],
    ] as const)(
        "should return %s for cron '%s' with allowHourly=%s, weekStart=%s (%s)",
        (cronExpression, allowHourly, weekStart, expectedType, _description) => {
            const result = simpleRecurrenceTypeMappingFn(
                undefined, // Date parameter is not used, so we can pass undefined
                cronExpression as string | undefined,
                allowHourly,
                false,
                weekStart as WeekStart | undefined,
            );
            expect(result).toBe(expectedType);
        },
    );

    // Test demonstrating that the date parameter is indeed optional and not used
    it("should work the same regardless of date parameter", () => {
        const cronExpression = "0 0 0 ? * *";
        const allowHourly = false;
        const weekStart = "Monday" as WeekStart;

        const resultWithDate = simpleRecurrenceTypeMappingFn(
            new Date("2024-01-15T10:30:00"),
            cronExpression,
            allowHourly,
            false,
            weekStart,
        );

        const resultWithoutDate = simpleRecurrenceTypeMappingFn(
            undefined,
            cronExpression,
            allowHourly,
            false,
            weekStart,
        );

        const resultWithNull = simpleRecurrenceTypeMappingFn(
            null,
            cronExpression,
            allowHourly,
            false,
            weekStart,
        );

        expect(resultWithDate).toBe(RECURRENCE_TYPES.DAILY);
        expect(resultWithoutDate).toBe(RECURRENCE_TYPES.DAILY);
        expect(resultWithNull).toBe(RECURRENCE_TYPES.DAILY);
        expect(resultWithDate).toBe(resultWithoutDate);
        expect(resultWithoutDate).toBe(resultWithNull);
    });
});
