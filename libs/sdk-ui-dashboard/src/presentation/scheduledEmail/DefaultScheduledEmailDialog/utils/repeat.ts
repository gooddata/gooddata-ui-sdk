// (C) 2019-2023 GoodData Corporation
import identity from "lodash/identity.js";
import { IScheduleEmailRepeat, IScheduleEmailRepeatFrequency } from "../interfaces.js";
import { REPEAT_EXECUTE_ON, REPEAT_TYPES } from "../constants.js";

import { getDate, getDay, getWeek } from "./datetime.js";

type IFragments = number[];
interface IFragmentObject {
    day?: number | string;
    week?: number;
    month?: number;
    year?: number;
    hour?: number;
    minute?: number;
    second?: number;
}

// Delimits the frequency part from the rest.
export const REPEAT_DELIM = "*";

// Delimits the fragments of repeatData string.
export const FRAGMENT_DELIM = ":";

// Delimits parts in one fragment.
export const LIST_DELIM = ",";

// Position of the REPEAT_DELIM determines the type of the repeat
const REPEAT_TYPE_BY_REPEAT_INDEX = ["none", "yearly", "monthly", "weekly", "daily"];

// Name of the each frangment by position.
const FRAGMENT_BY_INDEX = ["year", "month", "week", "day", "hour", "minute", "second"];

// Fills fragments to respective places.
function fillFragments(fragments: IFragments, fragObj: IFragmentObject) {
    for (const name in fragObj) {
        // eslint-disable-next-line no-prototype-builtins
        if (!fragObj.hasOwnProperty(name)) {
            continue;
        }
        const index = FRAGMENT_BY_INDEX.indexOf(name);
        fragments[index] = fragObj[name as keyof IFragmentObject] as number;
    }
}

function getRepeatBase(repeatType: string, repeatFrequency: IScheduleEmailRepeatFrequency): string {
    if (repeatType !== REPEAT_TYPES.CUSTOM) {
        return repeatType;
    }

    // eslint-disable-next-line no-prototype-builtins
    if (repeatFrequency.hasOwnProperty("day")) {
        return REPEAT_TYPES.DAILY;
    }

    // eslint-disable-next-line no-prototype-builtins
    if (repeatFrequency.hasOwnProperty("week")) {
        return REPEAT_TYPES.WEEKLY;
    }

    return REPEAT_TYPES.MONTHLY;
}

// Generates repeatData string
export function generateRepeatString(repeat: IScheduleEmailRepeat): string {
    const { repeatType, repeatFrequency, repeatPeriod, time } = repeat;

    const fragments: IFragments = [0, 0, 0, 0, 0, 0, 0];

    const repeatBase = getRepeatBase(repeatType, repeatFrequency);
    const repeatDelimiterIndex = REPEAT_TYPE_BY_REPEAT_INDEX.indexOf(repeatBase);

    // Repeats monthly
    if (repeatBase === REPEAT_TYPES.MONTHLY) {
        const str = repeatFrequency.month;
        // Repeats on a day of week in n-th week of month (e.g. 3rd Monday)
        if (repeatFrequency.month?.type === REPEAT_EXECUTE_ON.DAY_OF_WEEK) {
            const day = str!.dayOfWeek!.day;
            const week = str!.dayOfWeek!.week;
            fillFragments(fragments, { day, week });
        }
        // Repeats on a day of month 1-31
        else if (repeatFrequency.month?.type === REPEAT_EXECUTE_ON.DAY_OF_MONTH) {
            const day = str!.dayOfMonth;
            fillFragments(fragments, { day });
        }
    }

    // Repeats weekly
    else if (repeatBase === REPEAT_TYPES.WEEKLY) {
        const days = repeatFrequency!.week!.days;
        fillFragments(fragments, { day: days.join(LIST_DELIM) });
    }

    // Repeats daily
    else if (repeatBase === REPEAT_TYPES.DAILY) {
        // do nothing
    }

    // Fill the repeat period
    fragments[repeatDelimiterIndex - 1] = repeatPeriod;

    // Fill the time
    fillFragments(fragments, time);

    // Split array of fragments into frequency part and when part (so I can join them with '*' afterwards)
    const reptParts = [
        fragments.slice(0, repeatDelimiterIndex),
        fragments.slice(repeatDelimiterIndex, fragments.length),
    ];

    // Join into one repeatData string
    return reptParts.map((p: number[]) => p.join(FRAGMENT_DELIM)).join(REPEAT_DELIM);
}

export function setDailyRepeat(repeatData: IScheduleEmailRepeat): void {
    repeatData.repeatFrequency = {
        day: true,
    };
}

export function setMonthlyRepeat(
    repeatData: IScheduleEmailRepeat,
    repeatExecuteOn: string,
    startDate: Date,
): void {
    let repeatExecuteOnData;
    if (repeatExecuteOn === REPEAT_EXECUTE_ON.DAY_OF_MONTH) {
        repeatExecuteOnData = getDate(startDate);
    } else if (repeatExecuteOn === REPEAT_EXECUTE_ON.DAY_OF_WEEK) {
        repeatExecuteOnData = {
            day: getDay(startDate),
            week: getWeek(startDate),
        };
    }

    repeatData.repeatFrequency = {
        month: {
            type: repeatExecuteOn,
            [repeatExecuteOn]: repeatExecuteOnData,
        },
    };
}

export function setWeeklyRepeat(repeatData: IScheduleEmailRepeat, startDate: Date): void {
    repeatData.repeatFrequency = {
        week: {
            days: [getDay(startDate)],
        },
    };
}

const MONTH_INDEX = 1;
const WEEK_INDEX = 2;
const DAY_INDEX = 3;
const HOUR_INDEX = 4;
const MINUTE_INDEX = 5;
const SECOND_INDEX = 6;

function getFirstUsedFragmentIndex(fragments: number[]): number {
    const firstFragmentIndex = fragments.findIndex(identity);
    if (firstFragmentIndex === -1) {
        throw new Error("Invalid recurrence string");
    }
    return firstFragmentIndex;
}

export function parseRepeatString(repeat: string): IScheduleEmailRepeat {
    const fragmentsStrings: string[] = repeat.replace(REPEAT_DELIM, FRAGMENT_DELIM).split(FRAGMENT_DELIM);
    const fragments: number[] = fragmentsStrings.map((s) => {
        if (s.indexOf(LIST_DELIM) !== -1) {
            throw new Error("List items are not supported in recurrence string parsing");
        }
        return parseInt(s);
    });

    const firstFragmentIndex = getFirstUsedFragmentIndex(fragments);
    const firstFragmentValue = fragments[firstFragmentIndex];
    let repeatType = REPEAT_TYPES.CUSTOM;
    let repeatFrequency: IScheduleEmailRepeatFrequency = {};
    const customRepeatNumber = firstFragmentValue !== 1;
    if (firstFragmentIndex === MONTH_INDEX) {
        if (fragments[WEEK_INDEX] === 0) {
            repeatType = REPEAT_TYPES.CUSTOM;
            repeatFrequency = {
                month: {
                    type: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                    dayOfMonth: fragments[DAY_INDEX],
                },
            };
        } else {
            repeatType = customRepeatNumber ? REPEAT_TYPES.CUSTOM : REPEAT_TYPES.MONTHLY;
            repeatFrequency = {
                month: {
                    type: REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                    dayOfWeek: {
                        day: fragments[DAY_INDEX],
                        week: fragments[WEEK_INDEX],
                    },
                },
            };
        }
    }
    if (firstFragmentIndex === WEEK_INDEX) {
        repeatType = customRepeatNumber ? REPEAT_TYPES.CUSTOM : REPEAT_TYPES.WEEKLY;
        repeatFrequency = {
            week: {
                days: [fragments[3]],
            },
        };
    }
    if (firstFragmentIndex === DAY_INDEX) {
        repeatType = customRepeatNumber ? REPEAT_TYPES.CUSTOM : REPEAT_TYPES.DAILY;
        repeatFrequency = { day: true };
    }

    return {
        repeatType,
        repeatFrequency,
        repeatPeriod: firstFragmentValue,
        time: {
            hour: fragments[HOUR_INDEX],
            minute: fragments[MINUTE_INDEX],
            second: fragments[SECOND_INDEX],
        },
    };
}
