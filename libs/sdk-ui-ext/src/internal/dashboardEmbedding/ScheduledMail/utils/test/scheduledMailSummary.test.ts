// (C) 2019-2021 GoodData Corporation

import { IntlShape } from "react-intl";
import { createInternalIntl } from "../../../../utils/internalIntlProvider";
import { getScheduledEmailSummaryString } from "../scheduledMailSummary";
import { IScheduleEmailRepeatOptions } from "../../interfaces";
import { REPEAT_TYPES } from "../../constants";

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
    const intl: IntlShape = createInternalIntl();

    const getScheduleEmailRepeatOptions = (
        customOptions: ICustomRepeatOptions,
    ): IScheduleEmailRepeatOptions => {
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

    it("should generate correct summay message as selected time", () => {
        let repeatOptions = getScheduleEmailRepeatOptions({
            hour: 0,
            minute: 0,
        });
        let summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("Daily at 12:00 AM");

        repeatOptions = getScheduleEmailRepeatOptions({
            hour: 12,
            minute: 0,
        });
        summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("Daily at 12:00 PM");
    });

    it("should generate correct summay message with daily", () => {
        const repeatOptions = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.DAILY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("Daily at 12:00 AM");
    });

    it("should generate correct summay message with custom daily", () => {
        const customDayOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                day: true,
            },
        };
        let repeatOptions = getScheduleEmailRepeatOptions(customDayOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 1 day at 12:00 AM");

        repeatOptions = getScheduleEmailRepeatOptions({
            ...customDayOptions,
            repeatPeriod: 2,
        });
        summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 2 days at 12:00 AM");
    });

    it("should generate correct summay message with weekly", () => {
        const repeatOptions = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.WEEKLY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("Weekly on Friday at 12:00 AM");
    });

    it("should generate correct summay message with custom weekly", () => {
        const customWeekOptions = {
            repeatType: REPEAT_TYPES.CUSTOM,
            repeatPeriod: 1,
            repeatFrequency: {
                week: {
                    days: [5],
                },
            },
        };
        let repeatOptions = getScheduleEmailRepeatOptions(customWeekOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 1 week on the first Friday at 12:00 AM");

        repeatOptions = getScheduleEmailRepeatOptions({
            ...customWeekOptions,
            repeatPeriod: 2,
        });
        summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 2 weeks on the first Friday at 12:00 AM");
    });

    it("should generate correct summay message with monthly", () => {
        const repeatOptions = getScheduleEmailRepeatOptions({
            repeatType: REPEAT_TYPES.WEEKLY,
        });
        const summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("Weekly on Friday at 12:00 AM");
    });

    it("should generate correct summay message with monthly on date of month", () => {
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
        let repeatOptions = getScheduleEmailRepeatOptions(dayOfMonthOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 1 month on day 1 at 12:00 AM");

        repeatOptions = getScheduleEmailRepeatOptions({
            ...dayOfMonthOptions,
            repeatPeriod: 2,
        });
        summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 2 months on day 1 at 12:00 AM");
    });

    it("should generate correct summay message with monthly on day of week", () => {
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
        let repeatOptions = getScheduleEmailRepeatOptions(dayOfweekOptions);
        let summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 1 month on the first Friday at 12:00 AM");

        repeatOptions = getScheduleEmailRepeatOptions({
            ...dayOfweekOptions,
            repeatPeriod: 2,
        });
        summary = getScheduledEmailSummaryString(intl, repeatOptions);
        expect(summary).toEqual("every 2 months on the first Friday at 12:00 AM");
    });
});
