// (C) 2022-2025 GoodData Corporation

import { describe, it, beforeEach, expect } from "vitest";
import { normalizeTime } from "@gooddata/sdk-ui-kit";
import parseISO from "date-fns/parseISO/index.js";

import {
    toModifiedISOString,
    toNormalizedFirstRunAndCron,
    toNormalizedStartDate,
    toModifiedISOStringToTimezone,
    getTimezoneOffset,
} from "../date";
import { getUserTimezone } from "../timezone";

const toHours = -3600000;

function isoDate(year: number, month: number, day: number, hours: number = 0, minutes: number = 0) {
    return toModifiedISOString(new Date(year, month, day, hours, minutes));
}

function cronDaily(hours: number) {
    return `0 0 ${hours} ? * *`;
}

describe("toNormalizedFirstRunAndCron", () => {
    let now: Date;
    let offset: number;

    beforeEach(() => {
        now = new Date();
        offset = now.getTimezoneOffset() / 60;
    });

    it("no zone", () => {
        const res = toNormalizedFirstRunAndCron();

        const dt = toModifiedISOStringToTimezone(res.normalizedFirstRun, getUserTimezone().identifier);
        const cron = cronDaily(dt.date.getHours());
        expect(res.firstRun).toEqual(dt.iso);
        expect(res.cron).toEqual(cron);
    });

    it("Africa/Abidjan", () => {
        const timezoneOffset = getTimezoneOffset(now, "Africa/Abidjan") / toHours - offset;
        const res = toNormalizedFirstRunAndCron("Africa/Abidjan");

        const iso = isoDate(
            res.normalizedFirstRun.getFullYear(),
            res.normalizedFirstRun.getMonth(),
            res.normalizedFirstRun.getDate(),
            res.normalizedFirstRun.getHours() + timezoneOffset,
            0,
        );
        const dt = toModifiedISOStringToTimezone(res.normalizedFirstRun, getUserTimezone().identifier);
        const cron = cronDaily(dt.date.getHours());
        expect(res.firstRun).toEqual(iso);
        expect(res.cron).toEqual(cron);
    });

    it("Indian/Mauritius", () => {
        const timezoneOffset = getTimezoneOffset(now, "Indian/Mauritius") / toHours - offset;
        const res = toNormalizedFirstRunAndCron("Indian/Mauritius");

        const iso = isoDate(
            res.normalizedFirstRun.getFullYear(),
            res.normalizedFirstRun.getMonth(),
            res.normalizedFirstRun.getDate(),
            res.normalizedFirstRun.getHours() + timezoneOffset,
            0,
        );
        const dt = toModifiedISOStringToTimezone(res.normalizedFirstRun, getUserTimezone().identifier);
        const cron = cronDaily(dt.date.getHours());

        expect(res.firstRun).toEqual(iso);
        expect(res.cron).toEqual(cron);
    });

    it("America/Nassau", () => {
        const timezoneOffset = getTimezoneOffset(now, "America/Nassau") / toHours - offset;
        const res = toNormalizedFirstRunAndCron("America/Nassau");

        const iso = isoDate(
            res.normalizedFirstRun.getFullYear(),
            res.normalizedFirstRun.getMonth(),
            res.normalizedFirstRun.getDate(),
            res.normalizedFirstRun.getHours() + timezoneOffset,
            0,
        );
        const dt = toModifiedISOStringToTimezone(res.normalizedFirstRun, getUserTimezone().identifier);
        const cron = cronDaily(dt.date.getHours());

        expect(res.firstRun).toEqual(iso);
        expect(res.cron).toEqual(cron);
    });
});

describe("toNormalizedStartDate", () => {
    it("no parameters", () => {
        const res = toNormalizedStartDate();

        const iso = normalizeTime(parseISO(new Date().toISOString()), undefined, 60);
        expect(toModifiedISOString(res)).toEqual(toModifiedISOString(iso));
    });

    it("2021-01-01T00:00:00.000Z", () => {
        const res = toNormalizedStartDate("2021-01-01T00:00:00.000Z");
        expect(toModifiedISOString(res)).toEqual("2021-01-01T00:00:00Z");
    });

    it("2021-01-01T00:00:00.000Z, timezone Africa/Abidjan", () => {
        const res = toNormalizedStartDate("2021-01-01T00:00:00.000Z", "Africa/Abidjan");
        expect(toModifiedISOString(res)).toEqual("2020-12-31T23:00:00Z");
    });

    it("2021-01-01T00:00:00.000Z, timezone Indian/Mauritius", () => {
        const res = toNormalizedStartDate("2021-01-01T00:00:00.000Z", "Indian/Mauritius");
        expect(toModifiedISOString(res)).toEqual("2021-01-01T03:00:00Z");
    });

    it("2021-01-01T00:00:00.000Z, timezone America/Nassau", () => {
        const res = toNormalizedStartDate("2021-01-01T00:00:00.000Z", "America/Nassau");
        expect(toModifiedISOString(res)).toEqual("2020-12-31T18:00:00Z");
    });
});

describe("getTimezoneOffset", () => {
    let now: Date;

    beforeEach(() => {
        now = new Date();
    });

    it("UTC", () => {
        const offset = getTimezoneOffset(now, "UTC");
        expect(offset).toEqual(0);
    });

    it("GMT", () => {
        const offset = getTimezoneOffset(now, "GMT");
        expect(offset).toEqual(0);
    });

    it("Africa/Abidjan", () => {
        const offset = getTimezoneOffset(now, "Africa/Abidjan");
        expect(offset).toEqual(0);
    });

    it("Indian/Mauritius", () => {
        const offset = getTimezoneOffset(now, "Indian/Mauritius");
        expect(offset).toEqual(14400000);
    });

    it("America/Nassau", () => {
        // Nassau has winter time, so fix was needed
        const fixedDate = new Date("2022-01-01T00:00:00Z");
        const offset = getTimezoneOffset(fixedDate, "America/Nassau");
        expect(offset).toEqual(-18000000);
    });
});
