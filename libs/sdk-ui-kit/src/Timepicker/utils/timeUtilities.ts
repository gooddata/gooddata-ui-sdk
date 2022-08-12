// (C) 2019-2022 GoodData Corporation
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

export function updateTime(h: number, m: number): Date {
    const selectedTime = new Date();
    selectedTime.setHours(h);
    selectedTime.setMinutes(m);
    selectedTime.setSeconds(0);
    selectedTime.setMilliseconds(0);
    return selectedTime;
}

/**
 * @internal
 * export normalizeTime function for use outside this component
 * return 7:30 if time is 7:25
 * return 8:00 if time is 7:35
 * return 0:00 if time is 23:45
 */
export function normalizeTime(time: Date): Date {
    let h;
    let m;
    const hours = time.getHours();
    if (time.getMinutes() < TIME_ANCHOR) {
        h = hours;
        m = TIME_ANCHOR;
    } else {
        h = (hours + 1) % HOURS_IN_DAY;
        m = 0;
    }
    return updateTime(h, m);
}
