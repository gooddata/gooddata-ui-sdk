// (C) 2019-2020 GoodData Corporation
import { IScheduleEmailRepeat, IScheduleEmailRepeatFrequency } from "../interfaces";
import { REPEAT_EXECUTE_ON, REPEAT_TYPES } from "../constants";

import { getDate, getDay, getWeek } from "./datetime";

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
const REPEAT_DELIM = "*";

// Delimits the fragments of repeatData string.
const FRAGMENT_DELIM = ":";

// Delimits parts in one fragment.
const LIST_DELIM = ",";

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
        fragments[index] = fragObj[name];
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
    const { repeatType, repeatFrequency, repeatExecuteOn, repeatPeriod, time } = repeat;

    const fragments: IFragments = [0, 0, 0, 0, 0, 0, 0];

    const repeatBase = getRepeatBase(repeatType, repeatFrequency);
    const repeatDelimiterIndex = REPEAT_TYPE_BY_REPEAT_INDEX.indexOf(repeatBase);

    // Repeats monthly
    if (repeatBase === REPEAT_TYPES.MONTHLY) {
        const str = repeatFrequency.month;
        // Repeats on a day of week in n-th week of month (e.g. 3rd Monday)
        if (repeatExecuteOn === REPEAT_EXECUTE_ON.DAY_OF_WEEK) {
            const day = str!.dayOfWeek!.day;
            const week = str!.dayOfWeek!.week;
            fillFragments(fragments, { day, week });
        }
        // Repeats on a day of month 1-31
        else if (repeatExecuteOn === REPEAT_EXECUTE_ON.DAY_OF_MONTH) {
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
    const repeatString = reptParts.map((p: number[]) => p.join(FRAGMENT_DELIM)).join(REPEAT_DELIM);

    return repeatString;
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

    repeatData.repeatExecuteOn = repeatExecuteOn;
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
