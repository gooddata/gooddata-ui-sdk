// (C) 2007-2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type DatePeriodGranularity,
    type DateString,
    type EmptyValues,
} from "@gooddata/sdk-model";

import {
    DAY_END_TIME,
    DAY_END_TIME_WITH_SECONDS,
    DAY_START_TIME,
    DAY_START_TIME_WITH_SECONDS,
    platformDateFormat,
    platformDateTimeFormat,
    platformDateTimeFormatWithSeconds,
} from "../constants/Platform.js";
import { type IDateRange } from "../DateRangePicker/types.js";
import {
    type IUiAbsoluteDateFilterForm,
    type IUiAbsoluteGranularityDateFilterForm,
    isUiAbsoluteGranularityDateFilterForm,
} from "../interfaces/index.js";
import { type IPeriodRange } from "../PeriodRangePicker/types.js";
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
        granularity: "GDC.time.date",
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

/**
 * An option of the absolute form: days, or whole periods of a granularity.
 */
export type AbsoluteFormOption = IUiAbsoluteDateFilterForm | IUiAbsoluteGranularityDateFilterForm;

/**
 * The granularity tab of a period granularity. The configuration lists the week as the US week.
 */
export const datePeriodGranularityToTab = (granularity: DatePeriodGranularity): DateFilterGranularity =>
    granularity === "GDC.time.week" ? "GDC.time.week_us" : granularity;

/**
 * The period granularity of a granularity tab, undefined for the day and any other tab.
 */
export const tabToDatePeriodGranularity = (tab: DateFilterGranularity): DatePeriodGranularity | undefined => {
    switch (tab) {
        case "GDC.time.week_us":
            return "GDC.time.week";
        case "GDC.time.month":
        case "GDC.time.quarter":
        case "GDC.time.year":
            return tab;
        default:
            return undefined;
    }
};

/**
 * The granularity tab of an absolute form option. Days are on the day tab, whatever granularity they carry.
 */
export const getAbsoluteFormTab = (option: AbsoluteFormOption): DateFilterGranularity =>
    isUiAbsoluteGranularityDateFilterForm(option)
        ? datePeriodGranularityToTab(option.granularity)
        : "GDC.time.date";

/**
 * The empty option of the tab: days for the day tab, whole periods for the others. The identity and the
 * handling of empty values are kept.
 */
export const switchAbsoluteFormTab = (
    option: AbsoluteFormOption,
    tab: DateFilterGranularity,
): AbsoluteFormOption => {
    const { localIdentifier, name, visible, emptyValueHandling } = option;
    const common = { localIdentifier, name, visible, ...(emptyValueHandling ? { emptyValueHandling } : {}) };
    const granularity = tabToDatePeriodGranularity(tab);

    return granularity
        ? { ...common, type: "absoluteGranularityForm", granularity }
        : { ...common, type: "absoluteForm", granularity: "GDC.time.date" };
};

/**
 * The option of whole periods selected in a period picker.
 */
export const periodRangeToAbsoluteGranularityForm = (
    { from, to }: IPeriodRange,
    granularity: DatePeriodGranularity,
    localIdentifier: string,
    emptyValueHandling?: EmptyValues,
): IUiAbsoluteGranularityDateFilterForm => ({
    type: "absoluteGranularityForm",
    localIdentifier,
    name: "",
    visible: true,
    granularity,
    from,
    to,
    ...(emptyValueHandling ? { emptyValueHandling } : {}),
});

export const dateFilterValueToPeriodRange = (value: AbsoluteFormOption): IPeriodRange => {
    if (isUiAbsoluteGranularityDateFilterForm(value)) {
        return { from: value.from, to: value.to };
    }

    const from = convertPlatformDateStringToDate(value.from);
    const to = convertPlatformDateStringToDate(value.to);

    return {
        from: convertDateToPlatformDateString(from, platformDateFormat) ?? undefined,
        to: convertDateToPlatformDateString(to, platformDateFormat) ?? undefined,
    };
};

/**
 * @internal
 */
export interface IPeriodRangeToDateFilterValueOptions {
    range: IPeriodRange;
    localIdentifier: string;
    isTimeForAbsoluteRangeEnabled: boolean;
    emptyValueHandling?: EmptyValues;
    isSecondsForAbsoluteRangeEnabled?: boolean;
}

/**
 * Converts days selected in the period picker into an absolute date filter value, extending them to the
 * start/end of day when time-of-day is enabled.
 */
export const periodRangeToDateFilterValue = ({
    range,
    localIdentifier,
    isTimeForAbsoluteRangeEnabled,
    emptyValueHandling,
    isSecondsForAbsoluteRangeEnabled = false,
}: IPeriodRangeToDateFilterValueOptions): IUiAbsoluteDateFilterForm => {
    const withDayBoundaryTime = (date: DateString | undefined, time: string): DateString | undefined =>
        isTimeForAbsoluteRangeEnabled && date ? `${date} ${time}` : date;

    return {
        from: withDayBoundaryTime(
            range.from,
            isSecondsForAbsoluteRangeEnabled ? DAY_START_TIME_WITH_SECONDS : DAY_START_TIME,
        ),
        to: withDayBoundaryTime(
            range.to,
            isSecondsForAbsoluteRangeEnabled ? DAY_END_TIME_WITH_SECONDS : DAY_END_TIME,
        ),
        localIdentifier,
        type: "absoluteForm",
        name: "",
        visible: true,
        granularity: "GDC.time.date",
        ...(emptyValueHandling ? { emptyValueHandling } : {}),
    };
};
