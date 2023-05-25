// (C) 2019-2021 GoodData Corporation

import { createInternalIntl } from "../../../../localization/createInternalIntl.js";
import { getScheduledEmailSummaryString } from "../scheduledMailSummary.js";
import { IScheduleEmailRepeat } from "../../interfaces.js";
import { REPEAT_TYPES } from "../../constants.js";
import { describe, it, expect } from "vitest";

interface ICustomRepeatOptions {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    repeatType?: string;
    repeatPeriod?: number;
    repeatFrequency?: any;
    repeatExecuteOn?: string;
}

describe("schedule email utils", () => {
    const intl = createInternalIntl();

    const getScheduleEmailRepeatOptions = (
        customOptions: ICustomRepeatOptions,
    ): { repeatData: IScheduleEmailRepeat; startDate: Date } => {
        const {
            year = 2019,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            repeatType = REPEAT_TYPES.DAILY,
            repeatPeriod = 1,
            repeatFrequency = { day: true },
            repeatExecuteOn = "dayOfMonth",
        } = customOptions;

        const second = 0;
        const startDate = new Date(year, month, day, hour, minute);
        const repeatData = {
            repeatType,
            repeatPeriod,
            time: {
                hour,
                minute,
                second,
            },
            repeatFrequency,
            date: {
                day,
                month,
                year,
            },
            repeatExecuteOn,
        };

        return {
            repeatData,
            startDate,
        };
    };

    it("should generate correct summary message as selected time", () => {
        let { repeatData, startDate } = getScheduleEmailRepeatOptions({
            hour: 0,
            minute: 0,
        });
        let summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("Daily at 12:00 AM");

        ({ repeatData, startDate } = getScheduleEmailRepeatOptions({
            hour: 12,
            minute: 0,
        }));
        summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("Daily at 12:00 PM");
    });

    it("should generate correct summary message with daily", () => {
        const { repeatData, startDate } = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.DAILY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("Daily at 12:00 AM");
    });

    it("should generate correct summary message with custom daily", () => {
        const customDayOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                day: true,
            },
        };
        let { repeatData, startDate } = getScheduleEmailRepeatOptions(customDayOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 1 day at 12:00 AM");

        ({ repeatData, startDate } = getScheduleEmailRepeatOptions({
            ...customDayOptions,
            repeatPeriod: 2,
        }));
        summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 2 days at 12:00 AM");
    });

    it("should generate correct summary message with weekly", () => {
        const { repeatData, startDate } = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.WEEKLY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("Weekly on Friday at 12:00 AM");
    });

    it("should generate correct summary message with custom weekly", () => {
        const customWeekOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                week: {
                    days: [5],
                },
            },
        };
        let { repeatData, startDate } = getScheduleEmailRepeatOptions(customWeekOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 1 week on the first Friday at 12:00 AM");

        ({ repeatData, startDate } = getScheduleEmailRepeatOptions({
            ...customWeekOptions,
            repeatPeriod: 2,
        }));
        summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 2 weeks on the first Friday at 12:00 AM");
    });

    it("should generate correct summary message with monthly", () => {
        const { repeatData, startDate } = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.WEEKLY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("Weekly on Friday at 12:00 AM");
    });

    it("should generate correct summary message with monthly on date of month", () => {
        const dayOfMonthOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                month: {
                    dayOfMonth: 5,
                    type: "dayOfMonth",
                },
            },
            repeatExecuteOn: "dayOfMonth",
        };
        let { repeatData, startDate } = getScheduleEmailRepeatOptions(dayOfMonthOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 1 month on day 1 at 12:00 AM");

        ({ repeatData, startDate } = getScheduleEmailRepeatOptions({
            ...dayOfMonthOptions,
            repeatPeriod: 2,
        }));
        summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 2 months on day 1 at 12:00 AM");
    });

    it("should generate correct summary message with monthly on day of week", () => {
        const dayOfweekOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                month: {
                    dayOfWeek: {
                        week: 1,
                        day: 5,
                    },
                    type: "dayOfWeek",
                },
            },
            repeatExecuteOn: "dayOfWeek",
        };
        let { repeatData, startDate } = getScheduleEmailRepeatOptions(dayOfweekOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 1 month on the first Friday at 12:00 AM");

        ({ repeatData, startDate } = getScheduleEmailRepeatOptions({
            ...dayOfweekOptions,
            repeatPeriod: 2,
        }));
        summary = getScheduledEmailSummaryString(intl, repeatData, startDate);
        expect(summary).toEqual("every 2 months on the first Friday at 12:00 AM");
    });
});
