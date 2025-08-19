// (C) 2007-2025 GoodData Corporation
import format from "date-fns/format/index.js";
import isValid from "date-fns/isValid/index.js";
import parse from "date-fns/parse/index.js";
import moment from "moment";
import { DayModifiers, DayPickerRangeProps } from "react-day-picker";

import { ITime } from "./types.js";
import { platformDateFormat } from "../constants/Platform.js";

const mergeModifiers = (
    defaultModifiers: Partial<DayModifiers> | undefined,
    userModifiers: Partial<DayModifiers> | undefined,
): { modifiers: Partial<DayModifiers> } | undefined =>
    defaultModifiers ? { modifiers: { ...defaultModifiers, ...userModifiers } } : undefined;

const mergeDayPickerPropsBody = (
    defaultProps: DayPickerRangeProps,
    userProps: DayPickerRangeProps,
): DayPickerRangeProps => ({
    ...defaultProps,
    ...userProps,
    ...mergeModifiers(defaultProps.modifiers, userProps.modifiers),
});

export const mergeDayPickerProps = (
    defaultProps: DayPickerRangeProps,
    userProps: DayPickerRangeProps | undefined,
): DayPickerRangeProps => (userProps ? mergeDayPickerPropsBody(defaultProps, userProps) : defaultProps);

export const getPlatformStringFromDate = (value: Date) => {
    return value === undefined ? undefined : moment(value).format(platformDateFormat);
};

export const formatDate = (date: Date, dateFormat: string): string => {
    if (date === undefined || isNaN(date.getTime())) {
        return undefined;
    }
    return format(date, dateFormat);
};

export const parseDate = (str: string, dateFormat: string): Date | undefined => {
    try {
        const parsedDate: Date = parse(str, dateFormat, new Date());
        // parse only dates with 4-digit years. this mimics moment.js behavior - it parses only dates above 1900
        // this is to make sure that the picker input is not overwritten in the middle of writing the year with year "0002" when writing 2020.
        //
        // it's also necessary to parse only when the input string fully matches with the desired format
        // to make sure that the picker input is not overwritten in the middle of writing.
        // e.g, let's consider a case where dateFormat is "dd/MM/yyyy" and the DayPickerInput has already been filled with a valid string "13/09/2020",
        // then an user wants to change only the month "13/09/2020" -> "13/11/2020" by removing "09" and typing "11".
        // in such case the parsing should wait until the user completes typing "11" (otherwise if parsing is done right after the first "1" is typed,
        // the cursor automatically moves to the end of the string in the middle of writing, causing a bad experience for the user).
        if (
            isValid(parsedDate) &&
            parsedDate.getFullYear() >= 1000 &&
            str === formatDate(parsedDate, dateFormat)
        ) {
            return parsedDate;
        }
        return undefined;
    } catch {
        return undefined;
    }
};

export const isValidDate = (date: Date | undefined): boolean => {
    return date !== undefined && !isNaN(date.getTime());
};

export const setTimeToDate = (baseDate: Date | undefined, time: ITime | undefined) => {
    if (!isValidDate(baseDate)) {
        return undefined;
    }
    if (time === undefined) {
        return undefined;
    }

    const result = new Date(baseDate);
    result.setHours(time.hours, time.minutes);

    return result;
};

export const getTimeFromDate = (date: Date | undefined): ITime | undefined => {
    if (!isValidDate(date)) {
        return undefined;
    }
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
    };
};
