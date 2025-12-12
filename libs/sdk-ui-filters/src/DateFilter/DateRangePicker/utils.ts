// (C) 2007-2025 GoodData Corporation

import { format, isValid, parse } from "date-fns";
import moment from "moment";
import { type DayPickerProps, type Matcher } from "react-day-picker";

import { type ITime } from "./types.js";
import { platformDateFormat } from "../constants/Platform.js";

const mergeModifiers = (
    defaultModifiers: Record<string, Matcher | Matcher[] | undefined> | undefined,
    userModifiers: Record<string, Matcher | Matcher[] | undefined> | undefined,
): Record<string, Matcher | Matcher[] | undefined> | undefined =>
    defaultModifiers || userModifiers ? { ...defaultModifiers, ...userModifiers } : undefined;

const mergeDayPickerPropsBody = (defaultProps: DayPickerProps, userProps: DayPickerProps): DayPickerProps => {
    const mergedModifiers = mergeModifiers(defaultProps.modifiers, userProps.modifiers);

    return {
        ...defaultProps,
        ...userProps,
        ...(mergedModifiers ? { modifiers: mergedModifiers } : {}),
    } as DayPickerProps;
};

export const mergeDayPickerProps = (
    defaultProps: DayPickerProps,
    userProps: DayPickerProps | undefined,
): DayPickerProps => (userProps ? mergeDayPickerPropsBody(defaultProps, userProps) : defaultProps);

export const getPlatformStringFromDate = (value: Date) => {
    return value === undefined ? undefined : moment(value).format(platformDateFormat);
};

export const formatDate = (date: Date, dateFormat: string): string | undefined => {
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

    const result = new Date(baseDate!);
    result.setHours(time.hours!, time.minutes!);

    return result;
};

export const getTimeFromDate = (date: Date | undefined): ITime | undefined => {
    if (!isValidDate(date) || date === undefined) {
        return undefined;
    }
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
    };
};
