// (C) 2007-2024 GoodData Corporation
import toDate from "date-fns-tz/toDate";
import { describe, it, expect } from "vitest";
import { getDateTimeConfig, META_DATA_TIMEZONE } from "../dateTimeConfig.js";

interface ITestOptions {
    now: Date;
    updatedToday: string;
    updatedYesterday: string;
    updatedThisYear: string;
    updatedLastYear: string;
    timeZone: string;
}

const toZonedDate = (date: string, timeZone: string) => {
    const metaDataDate = toDate(date, { timeZone: META_DATA_TIMEZONE });
    return toDate(metaDataDate, { timeZone });
};

describe("InsightListItemDate", () => {
    describe("getDateTimeConfig today/yesterday/current year", () => {
        const shouldBehaveCorrectlyForDate = (options: ITestOptions) => {
            const { now, timeZone } = options;

            it("should correctly format today's date", () => {
                const { updatedToday } = options;
                const config = getDateTimeConfig(updatedToday, { now });
                expect(config).toMatchObject({
                    date: toZonedDate(updatedToday, timeZone),
                    isToday: true,
                    isYesterday: false,
                });
            });

            it("should correctly format yesterdays date", () => {
                const { updatedYesterday } = options;
                const config = getDateTimeConfig(updatedYesterday, { now });
                expect(config).toMatchObject({
                    date: toZonedDate(updatedYesterday, timeZone),
                    isToday: false,
                    isYesterday: true,
                });
            });

            it("should correctly format date in this year", () => {
                const { updatedThisYear } = options;
                const config = getDateTimeConfig(updatedThisYear, { now });
                expect(config).toMatchObject({
                    date: toZonedDate(updatedThisYear, timeZone),
                    isToday: false,
                    isYesterday: false,
                    isCurrentYear: true,
                });
            });

            it("should correctly format date in last year", () => {
                const { updatedLastYear } = options;
                const config = getDateTimeConfig(updatedLastYear, { now });
                expect(config).toMatchObject({
                    date: toZonedDate(updatedLastYear, timeZone),
                    isToday: false,
                    isYesterday: false,
                    isCurrentYear: false,
                });
            });
        };

        const options = {
            updatedToday: "2016-03-20 15:00",
            updatedYesterday: "2016-03-19 15:00",
            updatedThisYear: "2016-03-01 15:00",
            updatedLastYear: "2015-03-01 15:00",
        };

        describe("Europe/Prague default timezone", () => {
            const timeZone = "Europe/Prague";
            const now = toDate("2016-03-20 15:00", { timeZone });
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });

        describe("America/Los_Angeles default timezone", () => {
            const timeZone = "America/Los_Angeles";
            const now = toDate("2016-03-20 07:00", { timeZone });
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });

        describe("Asia/Bangkok default timezone", () => {
            const timeZone = "Asia/Bangkok";
            const now = toDate("2016-03-20 20:00", { timeZone });
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });
    });
});
