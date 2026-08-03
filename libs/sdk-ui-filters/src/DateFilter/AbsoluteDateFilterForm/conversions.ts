// (C) 2007-2026 GoodData Corporation

import { type EmptyValues } from "@gooddata/sdk-model";

import {
    platformDateFormat,
    platformDateTimeFormat,
    platformDateTimeFormatWithSeconds,
} from "../constants/Platform.js";
import { type IDateRange } from "../DateRangePicker/types.js";
import { type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";
import {
    convertDateToPlatformDateString,
    convertPlatformDateStringToDate,
} from "../utils/DateConversions.js";

export const dateRangeToDateFilterValue = (
    range: IDateRange,
    localIdentifier: string,
    isTimeForAbsoluteRangeEnabled: boolean,
    emptyValueHandling?: EmptyValues,
    isSecondsForAbsoluteRangeEnabled = false,
): IUiAbsoluteDateFilterForm => {
    const timeFormat = isSecondsForAbsoluteRangeEnabled
        ? platformDateTimeFormatWithSeconds
        : platformDateTimeFormat;
    const parsingFormat = isTimeForAbsoluteRangeEnabled ? timeFormat : platformDateFormat;

    return {
        from: convertDateToPlatformDateString(range.from, parsingFormat) ?? undefined,
        to: convertDateToPlatformDateString(range.to, parsingFormat) ?? undefined,
        localIdentifier,
        type: "absoluteForm",
        name: "",
        visible: true,
        ...(emptyValueHandling ? { emptyValueHandling } : {}),
    };
};

export const dateFilterValueToDateRange = (
    value: IUiAbsoluteDateFilterForm,
    isTimeForAbsoluteRangeEnabled = false,
    isSecondsForAbsoluteRangeEnabled = false,
): IDateRange => {
    const isFromTimeDefined = value.from && value.from.split(" ").length > 1;
    const isToTimeDefined = value.to && value.to.split(" ").length > 1;

    const from = value ? (convertPlatformDateStringToDate(value.from) ?? undefined) : undefined;
    const to = value ? (convertPlatformDateStringToDate(value.to) ?? undefined) : undefined;

    if (from && !isFromTimeDefined && isTimeForAbsoluteRangeEnabled) {
        from.setHours(0);
        from.setMinutes(0);
        from.setSeconds(0);
    }

    if (to && !isToTimeDefined && isTimeForAbsoluteRangeEnabled) {
        to.setHours(23);
        to.setMinutes(59);
        to.setSeconds(isSecondsForAbsoluteRangeEnabled ? 59 : 0);
    }
    return { from, to };
};
