// (C) 2007-2021 GoodData Corporation
import moment from "moment-timezone";

import { getDateTimeConfig, META_DATA_TIMEZONE } from "../InsightListItemDate";

interface ITestOptions {
    now: Date;
    updatedToday: string;
    updatedYesterday: string;
    updatedThisYear: string;
    updatedLastYear: string;
    timeZone: string;
}

const toZonedDate = (date: string, timeZone: string) => {
    const dateWithTimezone = moment.tz(date, META_DATA_TIMEZONE);
    return moment.tz(dateWithTimezone, timeZone).toDate();
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
            const now = moment.tz("2016-03-20 15:00", timeZone).toDate();
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });

        describe("America/Los_Angeles default timezone", () => {
            const timeZone = "America/Los_Angeles";
            const now = moment.tz("2016-03-20 07:00", timeZone).toDate();
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });

        describe("Asia/Bangkok default timezone", () => {
            const timeZone = "Asia/Bangkok";
            const now = moment.tz("2016-03-20 20:00", timeZone).toDate();
            shouldBehaveCorrectlyForDate({ now, timeZone, ...options });
        });
    });
});
