// (C) 2022-2025 GoodData Corporation
import parseISO from "date-fns/parseISO/index.js";

import { normalizeTime } from "@gooddata/sdk-ui-kit";

import { getDefaultCronExpression } from "./cron.js";
import { getUserTimezone } from "./timezone.js";

/**
 * In order to match backend format, we need to remove milliseconds from the date.
 * Otherwise comparing newly created dates (as ISO string) with ISO dates from backend will fail.
 */
export const toModifiedISOString = (date: Date) => {
    return date.toISOString().split(".")[0] + "Z";
};

/**
 * In order to match backend format, we need to remove milliseconds from the date and also convert it to UTC
 * based on the provided timezone.
 */
export const toModifiedISOStringToTimezone = (date: Date, timezone?: string) => {
    if (timezone) {
        const offset = getTimezoneOffsetInISOFormat(date, timezone);

        const stringDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
        ].join("-");
        const stringTime = [
            date.getHours().toString().padStart(2, "0"),
            date.getMinutes().toString().padStart(2, "0"),
            date.getSeconds().toString().padStart(2, "0"),
        ].join(":");
        const string = `${stringDate}T${stringTime}${offset}`;
        const dateUpdated = new Date(string);

        return {
            date: dateUpdated,
            iso: toModifiedISOString(dateUpdated),
        };
    }
    return {
        date,
        iso: toModifiedISOString(date),
    };
};

/**
 * In order to match backend format, we need to remove milliseconds from the date and also convert it to UTC
 * based on the provided from timezone and to timezone.
 */
export const toModifiedISOStringFromTimezone = (date: Date, fromTimezone: string, toTimezone?: string) => {
    if (fromTimezone && toTimezone) {
        const offsetFrom = getTimezoneOffset(date, fromTimezone);
        const offsetTo = getTimezoneOffset(date, toTimezone);
        const dateUpdated = new Date(date.getTime() + offsetFrom - offsetTo);

        return {
            date: dateUpdated,
            iso: toModifiedISOString(dateUpdated),
        };
    }
    return {
        date,
        iso: toModifiedISOString(date),
    };
};

export function toNormalizedFirstRunAndCron(timezone?: string) {
    const normalizedFirstRun = normalizeTime(parseISO(new Date().toISOString()), undefined, 60);
    const { iso: firstRun } = toModifiedISOStringToTimezone(
        normalizedFirstRun,
        timezone ?? getUserTimezone().identifier,
    );

    // We need to calculate the relative time zones difference to get the correct cron expression
    const isoUrl = parseISO(firstRun);
    const offsetFrom = getTimezoneOffset(isoUrl, timezone ?? getUserTimezone().identifier);
    const offsetTo = getTimezoneOffset(isoUrl, getUserTimezone().identifier);
    const firstRunDate = new Date(isoUrl.getTime() + offsetFrom - offsetTo);
    const cron = getDefaultCronExpression(firstRunDate);

    return {
        normalizedFirstRun,
        firstRun,
        cron,
    };
}

export function toNormalizedStartDate(firstRun?: string, timezone?: string) {
    if (firstRun) {
        const { iso } = toModifiedISOStringFromTimezone(
            parseISO(firstRun),
            timezone ?? getUserTimezone().identifier,
            getUserTimezone().identifier,
        );
        return parseISO(iso);
    }
    return normalizeTime(parseISO(new Date().toISOString()), undefined, 60);
}

const UTC_OFFSET = "Z";

function getTimezoneOffsetInISOFormat(date: Date, timeZone: string) {
    const str = date.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" });
    const tmz = str.split(" ").pop() ?? UTC_OFFSET;
    const offset = tmz.replace("GMT", "");

    //UTC offset
    if (offset === UTC_OFFSET) {
        return UTC_OFFSET;
    }
    //GMT offset
    if (offset === "") {
        return UTC_OFFSET;
    }
    //GMT offset with minutes
    return offset;
}

export function getTimezoneOffset(date: Date, timeZone: string) {
    const iso = getTimezoneOffsetInISOFormat(date, timeZone);

    if (iso === UTC_OFFSET) {
        return 0;
    }

    const [hoursStr, minutesStr] = iso.split(":");

    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    return (hours * 60 + minutes) * 60 * 1000;
}
