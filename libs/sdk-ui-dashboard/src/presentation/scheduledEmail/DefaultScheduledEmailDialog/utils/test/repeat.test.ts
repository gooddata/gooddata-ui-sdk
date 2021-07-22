// (C) 2019-2021 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

import { generateRepeatString, setDailyRepeat, setMonthlyRepeat, setWeeklyRepeat } from "../repeat";
import { REPEAT_EXECUTE_ON, REPEAT_TYPES } from "../../constants";
import {
    IScheduleEmailRepeat,
    IScheduleEmailRepeatDate,
    IScheduleEmailRepeatFrequency,
    IScheduleEmailRepeatFrequencyDayOfWeek,
    IScheduleEmailRepeatTime,
} from "../../interfaces";
import { getDate, getDay, getMonth, getWeek, getYear } from "../datetime";

describe("RepeatGenerator", () => {
    const now = new Date(2019, 10, 10, 10, 30, 0, 0);

    const date: IScheduleEmailRepeatDate = {
        day: getDay(now),
        month: getMonth(now),
        year: getYear(now),
    };

    const time: IScheduleEmailRepeatTime = {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
    };

    const repeatData: IScheduleEmailRepeat = {
        date,
        repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_WEEK,
        repeatFrequency: { month: { dayOfWeek: { day: 4, week: 2 }, type: REPEAT_EXECUTE_ON.DAY_OF_WEEK } },
        repeatPeriod: 9,
        repeatType: REPEAT_TYPES.CUSTOM,
        time,
    };

    describe("generateRepeatString", () => {
        type Scenario = [
            pattern: string,
            repeatType: string,
            frequency?: IScheduleEmailRepeatFrequency,
            executeOn?: string,
            period?: number,
        ];

        const scenarios: Scenario[] = [
            ["0:0:0:1*10:30:0", REPEAT_TYPES.DAILY, undefined, undefined, undefined],
            ["0:0:1*4:10:30:0", REPEAT_TYPES.WEEKLY, { week: { days: [4] } }, undefined, undefined],
            ["0:0:1*4,5:10:30:0", REPEAT_TYPES.WEEKLY, { week: { days: [4, 5] } }, undefined, undefined],
            [
                "0:1*0:10:10:30:0",
                REPEAT_TYPES.MONTHLY,
                { month: { dayOfMonth: 10, type: REPEAT_EXECUTE_ON.DAY_OF_MONTH } },
                REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                undefined,
            ],
            [
                "0:1*2:4:10:30:0",
                REPEAT_TYPES.MONTHLY,
                { month: { dayOfWeek: { day: 4, week: 2 }, type: REPEAT_EXECUTE_ON.DAY_OF_WEEK } },
                REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                undefined,
            ],
            ["0:0:0:1*10:30:0", REPEAT_TYPES.CUSTOM, { day: undefined }, undefined, undefined],
            ["0:0:1*4:10:30:0", REPEAT_TYPES.CUSTOM, { week: { days: [4] } }, undefined, undefined],
            ["0:0:1*4,5:10:30:0", REPEAT_TYPES.CUSTOM, { week: { days: [4, 5] } }, undefined, undefined],
            [
                "0:1*0:10:10:30:0",
                REPEAT_TYPES.CUSTOM,
                { month: { dayOfMonth: 10, type: REPEAT_EXECUTE_ON.DAY_OF_MONTH } },
                REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                undefined,
            ],
            [
                "0:1*2:4:10:30:0",
                REPEAT_TYPES.CUSTOM,
                { month: { dayOfWeek: { day: 4, week: 2 }, type: REPEAT_EXECUTE_ON.DAY_OF_WEEK } },
                REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                undefined,
            ],
            [
                "0:9*2:4:10:30:0",
                REPEAT_TYPES.CUSTOM,
                { month: { dayOfWeek: { day: 4, week: 2 }, type: REPEAT_EXECUTE_ON.DAY_OF_WEEK } },
                REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                9,
            ],
        ];

        it.each(scenarios)(
            "should generate repeat string %s when repeat type is %s",
            (
                expectedRepeatString,
                repeatType,
                repeatFrequency = { day: true },
                repeatExecuteOn = REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                repeatPeriod = 1,
            ) => {
                expect(
                    generateRepeatString({
                        date,
                        repeatExecuteOn,
                        repeatFrequency,
                        repeatPeriod,
                        repeatType,
                        time,
                    }),
                ).toBe(expectedRepeatString);
            },
        );
    });

    describe("getDay", () => {
        it("should convert sunday correctly", () => {
            const monthZeroBased = 7;
            const monthOneBased = monthZeroBased + 1;

            const sunday = new Date(2021, monthZeroBased, 22, 10, 30, 0, 0);
            const sundayDate: IScheduleEmailRepeatDate = {
                day: getDay(sunday),
                month: getMonth(sunday),
                year: getYear(sunday),
            };
            expect(sundayDate).toEqual({
                day: 7,
                month: monthOneBased,
                year: 2021,
            });
        });
    });

    describe("setDailyRepeat", () => {
        it("should update daily repeat value", () => {
            const data = cloneDeep(repeatData);
            setDailyRepeat(data);
            expect(data).toEqual({
                ...repeatData,
                repeatFrequency: {
                    day: true,
                },
            });
        });
    });

    describe("setMonthlyRepeat", () => {
        it.each([
            [REPEAT_EXECUTE_ON.DAY_OF_MONTH, getDate(now)],
            [
                REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                {
                    day: getDay(now),
                    week: getWeek(now),
                },
            ],
        ])(
            "should update monthly repeat value when repeatExecuteOn is %s",
            (
                repeatExecuteOn: string,
                repeatExecuteOnData: number | IScheduleEmailRepeatFrequencyDayOfWeek,
            ) => {
                const data = cloneDeep(repeatData);
                setMonthlyRepeat(data, repeatExecuteOn, now);
                expect(data).toEqual({
                    ...repeatData,
                    repeatExecuteOn,
                    repeatFrequency: {
                        month: {
                            type: repeatExecuteOn,
                            [repeatExecuteOn]: repeatExecuteOnData,
                        },
                    },
                });
            },
        );
    });

    describe("setWeeklyRepeat", () => {
        it("should update weekly repeat value", () => {
            const data = cloneDeep(repeatData);
            setWeeklyRepeat(data, now);
            expect(data).toEqual({
                ...repeatData,
                repeatFrequency: {
                    week: {
                        days: [getDay(now)],
                    },
                },
            });
        });
    });
});
