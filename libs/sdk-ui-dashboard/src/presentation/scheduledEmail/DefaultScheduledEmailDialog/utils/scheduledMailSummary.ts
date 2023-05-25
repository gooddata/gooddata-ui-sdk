// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import {
    IScheduleEmailRepeatTime,
    IScheduleEmailRepeatFrequency,
    IScheduleEmailRepeat,
} from "../interfaces.js";
import { REPEAT_TYPES, REPEAT_FREQUENCIES, FREQUENCY_TYPE, REPEAT_EXECUTE_ON } from "../constants.js";

import { getDayName, getWeek, getDate } from "./datetime.js";
import { messages } from "../../../../locales.js";

const AM = "AM";
const PM = "PM";

function getRepeatFrequencyType(repeatFrequency: IScheduleEmailRepeatFrequency): string {
    // eslint-disable-next-line no-prototype-builtins
    const result = FREQUENCY_TYPE.find((type) => repeatFrequency.hasOwnProperty(type));
    invariant(result, "Unknown scheduled email frequency");
    return result;
}

function getScheduledEmailRepeatString(
    intl: IntlShape,
    options: IScheduleEmailRepeat,
    startDate: Date,
): string {
    const { repeatType, repeatPeriod, repeatFrequency } = options;
    const isCustomRepeatType = repeatType === REPEAT_TYPES.CUSTOM;
    const day = getDayName(startDate);
    const week = getWeek(startDate);
    if (!isCustomRepeatType) {
        return intl.formatMessage(messages[`scheduleDialogEmailRepeats_${repeatType}`], { day, week });
    }

    const every = intl.formatMessage({
        id: "dialogs.schedule.email.repeats.every",
    });
    const repeatFrequencyType = getRepeatFrequencyType(repeatFrequency);
    const frequencies = intl.formatMessage(
        messages[`scheduleDialogEmailRepeatsFrequencies_${repeatFrequencyType}`],
        {
            n: repeatPeriod,
        },
    );
    const appliedRepeatExecuteOn =
        repeatFrequencyType === REPEAT_FREQUENCIES.WEEK
            ? REPEAT_EXECUTE_ON.DAY_OF_WEEK
            : repeatFrequency.month?.type;

    const executeOn =
        repeatFrequencyType !== REPEAT_FREQUENCIES.DAY
            ? intl.formatMessage(messages[`scheduleDialogEmailRepeatsExecuteOn_${appliedRepeatExecuteOn}`], {
                  date: getDate(startDate),
                  day: getDayName(startDate),
                  week: getWeek(startDate),
              })
            : "";
    // every 2 months on the first Friday
    return `${every} ${repeatPeriod} ${frequencies} ${executeOn}`.trim();
}

function getFormattedTime(time: IScheduleEmailRepeatTime): string {
    const { hour, minute } = time;
    const timeSuffix = getTimePeriod(hour);
    const formattedMinute = getFormattedMinute(minute);
    const formattedHour = getFormattedHour(hour);

    // 12:00 AM
    return `${formattedHour}:${formattedMinute} ${timeSuffix}`;
}

function getTimePeriod(hour: number): string {
    return hour >= 12 ? PM : AM;
}

function getFormattedMinute(minute: number): string {
    return minute < 10 ? "0" + minute : "" + minute;
}

function getFormattedHour(hour: number): number {
    let formattedHour = hour > 12 ? hour - 12 : hour;
    if (hour === 0) {
        formattedHour = 12;
    }
    return formattedHour;
}

export function getScheduledEmailSummaryString(
    intl: IntlShape,
    recurrency: IScheduleEmailRepeat,
    startDate: Date,
): string {
    const repeatDays = getScheduledEmailRepeatString(intl, recurrency, startDate);
    const atLocalization = intl.formatMessage({ id: "gs.date.at" });
    const time = getFormattedTime(recurrency.time);

    // every 2 months on the first Friday at 12:00 AM
    return `${repeatDays} ${atLocalization} ${time}`;
}
