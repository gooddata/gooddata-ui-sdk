// (C) 2007-2020 GoodData Corporation
import toDate from "date-fns-tz/toDate";

import { getDateTimeConfig } from "../InsightListItemDate";

interface ITestOptions {
    now: Date;
    updatedToday: string;
    updatedYesterday: string;
    updatedThisYear: string;
    updatedLastYear: string;
}

describe("InsightListItemDate", () => {
    describe("getDateTimeConfig today/yesterday/current year", () => {
        const shouldBehaveCorrectlyForDate = (options: ITestOptions) => {
            const { now, updatedToday, updatedYesterday, updatedThisYear, updatedLastYear } = options;

            it("should correctly format today's date", () => {
                const config = getDateTimeConfig(updatedToday, { now });
                expect(config).toMatchObject({
                    isToday: true,
                    isYesterday: false,
                });
            });

            it("should correctly format yesterdays date", () => {
                const config = getDateTimeConfig(updatedYesterday, { now });
                expect(config).toMatchObject({
                    isToday: false,
                    isYesterday: true,
                });
            });

            it("should correctly format date in this year", () => {
                const config = getDateTimeConfig(updatedThisYear, { now });
                expect(config).toMatchObject({
                    isToday: false,
                    isYesterday: false,
                    isCurrentYear: true,
                });
            });

            it("should correctly format date in last year", () => {
                const config = getDateTimeConfig(updatedLastYear, { now });
                expect(config).toMatchObject({
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
            const now = toDate("2016-03-20 15:00", { timeZone: "Europe/Prague" });
            shouldBehaveCorrectlyForDate({ now, ...options });
        });

        describe("America/Los_Angeles default timezone", () => {
            const now = toDate("2016-03-20 07:00", { timeZone: "America/Los_Angeles" });
            shouldBehaveCorrectlyForDate({ now, ...options });
        });

        describe("Asia/Bangkok default timezone", () => {
            const now = toDate("2016-03-20 20:00", { timeZone: "Asia/Bangkok" });
            shouldBehaveCorrectlyForDate({ now, ...options });
        });
    });
});
