// (C) 2007-2022 GoodData Corporation

import { IDateRange } from "../DateRangePicker/DateRangePicker.js";
import {
    convertDateToPlatformDateString,
    convertPlatformDateStringToDate,
} from "../utils/DateConversions.js";
import { IUiAbsoluteDateFilterForm } from "../interfaces/index.js";
import { platformDateFormat, platformDateTimeFormat } from "../constants/Platform.js";

export const dateRangeToDateFilterValue = (
    range: IDateRange,
    localIdentifier: string,
    isTimeForAbsoluteRangeEnabled: boolean,
): IUiAbsoluteDateFilterForm => {
    const parsingFormat = isTimeForAbsoluteRangeEnabled ? platformDateTimeFormat : platformDateFormat;

    return {
        from: convertDateToPlatformDateString(range.from, parsingFormat),
        to: convertDateToPlatformDateString(range.to, parsingFormat),
        localIdentifier,
        type: "absoluteForm",
        name: "",
        visible: true,
    };
};

export const dateFilterValueToDateRange = (
    value: IUiAbsoluteDateFilterForm,
    isTimeForAbsoluteRangeEnabled = false,
): IDateRange => {
    const isFromTimeDefined = value.from && value.from.split(" ").length > 1;
    const isToTimeDefined = value.to && value.to.split(" ").length > 1;

    const from = value && convertPlatformDateStringToDate(value.from);
    const to = value && convertPlatformDateStringToDate(value.to);

    if (from && !isFromTimeDefined && isTimeForAbsoluteRangeEnabled) {
        from.setHours(0);
        from.setMinutes(0);
    }

    if (to && !isToTimeDefined && isTimeForAbsoluteRangeEnabled) {
        to.setHours(23);
        to.setMinutes(59);
    }

    return { from, to };
};
