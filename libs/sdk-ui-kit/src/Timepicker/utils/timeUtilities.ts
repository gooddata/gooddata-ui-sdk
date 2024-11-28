// (C) 2019-2024 GoodData Corporation
import moment from "moment";

export const HOURS_IN_DAY = 24;
export const TIME_ANCHOR = 30;
const TIME_FORMAT: string = "hh:mm A";

/**
 * @internal
 */
export function formatTime(h: number, m: number, format?: string): string {
    return moment()
        .hours(h)
        .minutes(m)
        .format(format || TIME_FORMAT);
}

export function updateTime(h: number, m: number, date?: Date): Date {
    const selectedTime = date ? new Date(date) : new Date();
    selectedTime.setHours(h);
    selectedTime.setMinutes(m);
    selectedTime.setSeconds(0);
    selectedTime.setMilliseconds(0);
    return selectedTime;
}

function getNormalizedHourAndMinute(time?: Date, timeAnchor = TIME_ANCHOR) {
    let h: number;
    let m: number;
    const hours = time?.getHours() ?? 0;
    const minutes = time?.getMinutes() ?? 0;

    // Do not shift time if it is exactly on the new hour (0 == 60 when timeAnchor is 60)
    if (minutes === 0 && timeAnchor === 60) {
        return { hours, minutes: 0 };
    }

    if (minutes < timeAnchor) {
        h = hours;
        m = timeAnchor;
    } else {
        h = (hours + 1) % HOURS_IN_DAY;
        m = 0;
    }

    return { hours: h, minutes: m };
}

/**
 * @internal
 *
 * Normalizes time based on time anchor (default is 30 minutes)
 * When date is also provided, it combines date with the normalized time
 *
 * return 7:30 if time is 7:25
 * return 8:00 if time is 7:35
 * return 0:00 if time is 23:45
 */
export function normalizeTime(time?: Date, date?: Date, timeAnchor = TIME_ANCHOR): Date {
    const { hours, minutes } = getNormalizedHourAndMinute(time, timeAnchor);
    return updateTime(hours, minutes, date || time);
}
