// (C) 2019-2026 GoodData Corporation

import { format } from "date-fns";
import { capitalize } from "lodash-es";
import moment from "moment";

import {
    type DateFilterGranularity,
    type IAbsoluteDateFilterPreset,
    type ILowerBoundedFilter,
    type IRelativeDateFilterPreset,
    type IUpperBoundedFilter,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
    isUpperBound,
} from "@gooddata/sdk-model";
import { type ILocale, type ITranslations, getIntl } from "@gooddata/sdk-ui";

import { type IDateAndMessageTranslator, type IMessageTranslator } from "./Translators.js";
import { messages } from "../../../locales.js";
import {
    type DateFilterLabelMode,
    granularityIntlCodes,
    granularityIntlCodesFull,
} from "../../constants/i18n.js";
import {
    DAY_END_TIME,
    DAY_START_TIME,
    DEFAULT_DATE_FORMAT,
    TIME_FORMAT,
    TIME_FORMAT_WITH_SEPARATOR,
} from "../../constants/Platform.js";
import {
    type DateFilterOption,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../../interfaces/index.js";
import { convertPlatformDateStringToDate } from "../DateConversions.js";

export const getTimeRange = (dateFrom: Date, dateTo: Date, splitter = "\u2013"): string => {
    const fromTime = format(dateFrom, TIME_FORMAT);
    const toTime = format(dateTo, TIME_FORMAT);

    return fromTime === toTime ? fromTime : `${fromTime} ${splitter} ${toTime}`;
};

const isTimeForWholeDay = (dateFrom: Date, dateTo: Date) =>
    dateFrom.getHours() === 0 &&
    dateFrom.getMinutes() === 0 &&
    dateTo.getHours() === 23 &&
    dateTo.getMinutes() === 59;

const adjustDatetime = (date: string | Date, isTimeEnabled: boolean, defaultTime = DAY_START_TIME) => {
    if (!(typeof date === "string")) {
        return date;
    }

    if (isTimeEnabled && date.split(" ").length === 1) {
        return `${date} ${defaultTime}`;
    }

    return date;
};

export const formatAbsoluteDateRange = (
    from: Date | string,
    to: Date | string,
    dateFormat: string,
    splitter = "\u2013",
): string => {
    const isTimeEnabled = dateFormat.includes(TIME_FORMAT);
    const dateFormatWithoutTime = dateFormat.replace(TIME_FORMAT_WITH_SEPARATOR, "");

    // append start and end times if necessary
    const adjustedFrom = adjustDatetime(from, isTimeEnabled, DAY_START_TIME);
    const adjustedTo = adjustDatetime(to, isTimeEnabled, DAY_END_TIME);

    const fromDate = convertPlatformDateStringToDate(adjustedFrom) ?? undefined;
    const toDate = convertPlatformDateStringToDate(adjustedTo) ?? undefined;
    const coversWholeDay = fromDate && toDate ? isTimeForWholeDay(fromDate, toDate) : false;

    if (fromDate && toDate && moment(fromDate).isSame(toDate, "day")) {
        if (isTimeEnabled && !coversWholeDay) {
            return `${format(fromDate, dateFormatWithoutTime)}, ${getTimeRange(fromDate, toDate, splitter)}`;
        } else {
            return format(fromDate, dateFormatWithoutTime);
        }
    }

    // do not show time in case of whole day coverage
    const displayDateFormat = coversWholeDay ? dateFormatWithoutTime : dateFormat;

    const fromTitle = fromDate ? format(fromDate, displayDateFormat) : "";
    const toTitle = toDate ? format(toDate, displayDateFormat) : "";

    return `${fromTitle} ${splitter} ${toTitle}`;
};

const relativeDateRangeFormatters: Array<{
    predicate: (from: number, to: number) => boolean;
    formatter: (
        from: number,
        to: number,
        intlGranularity: string,
        translator: IDateAndMessageTranslator,
        boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter,
    ) => string;
}> = [
    {
        // Today, This month, This month to date
        predicate: (from, to) => from === 0 && to === 0,
        formatter: (_from, _to, intlGranularity, translator, boundedFilter) => {
            if (isUpperBound(boundedFilter) && boundedFilter.to === 0) {
                return translator.formatMessage(messages[`this${capitalize(intlGranularity)}ToDate`]);
            }
            return translator.formatMessage(messages[`this${capitalize(intlGranularity)}`]);
        },
    },
    {
        // Tomorrow, Next month
        predicate: (from, to) => from === 1 && to === 1,
        formatter: (_from, _to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`next${capitalize(intlGranularity)}`]),
    },
    {
        // Yesterday, Last month
        predicate: (from, to) => from === -1 && to === -1,
        formatter: (_from, _to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`last${capitalize(intlGranularity)}`]),
    },
    {
        // Next N days (months)
        predicate: (from) => from === 0,
        formatter: (_from, to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`nextN${capitalize(intlGranularity)}s`], {
                n: Math.abs(to) + 1,
            }),
    },
    {
        // Last N days (months)
        predicate: (_from, to) => to === 0,
        formatter: (from, _to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`lastN${capitalize(intlGranularity)}s`], {
                n: Math.abs(from) + 1,
            }),
    },
    {
        // From N days ago to N days ago
        predicate: (from, to) => from < 0 && from === to,
        formatter: (from, _to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`${intlGranularity}s.past.sameValue`], {
                value: Math.abs(from),
            }),
    },
    {
        // From N days ago to N days ahead
        predicate: (from, to) => from > 0 && from === to,
        formatter: (from, _to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`${intlGranularity}s.future.sameValue`], {
                value: Math.abs(from),
            }),
    },
    {
        // From N days ago to M days ago
        predicate: (from, to) => from < 0 && to < 0,
        formatter: (from, to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`${intlGranularity}s.past`], {
                from: Math.abs(from),
                to: Math.abs(to),
            }),
    },
    {
        // From N days ahead to M days ahead
        predicate: (from, to) => from > 0 && to > 0,
        formatter: (from, to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`${intlGranularity}s.future`], {
                from: Math.abs(from),
                to: Math.abs(to),
            }),
    },
    {
        // From N days ago to M days ahead
        predicate: () => true,
        formatter: (from, to, intlGranularity, translator, _bound) =>
            translator.formatMessage(messages[`${intlGranularity}s.mixed`], {
                from: Math.abs(from),
                to: Math.abs(to),
            }),
    },
];

export const formatRelativeDateRange = (
    from: number,
    to: number,
    granularity: DateFilterGranularity,
    translator: IDateAndMessageTranslator,
    labelMode: DateFilterLabelMode,
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter,
): string => {
    const intlCodes = labelMode === "full" ? granularityIntlCodesFull : granularityIntlCodes;
    const intlGranularity = intlCodes[granularity];
    if (intlGranularity === undefined) {
        return granularity; // in the case when invalid granularity was found in metadata
    }
    const foundFormatter = relativeDateRangeFormatters.find((f) => f.predicate(from, to));
    if (!foundFormatter) {
        return "";
    }
    return foundFormatter.formatter(from, to, intlGranularity, translator, boundedFilter);
};

const getAllTimeFilterRepresentation = (translator: IMessageTranslator): string =>
    translator.formatMessage({ id: "filters.allTime.title" });

const getAbsoluteFormFilterRepresentation = (filter: IUiAbsoluteDateFilterForm, dateFormat: string): string =>
    filter.from && filter.to ? formatAbsoluteDateRange(filter.from, filter.to, dateFormat) : "";

const getAbsolutePresetFilterRepresentation = (
    filter: IAbsoluteDateFilterPreset,
    dateFormat: string,
): string => formatAbsoluteDateRange(filter.from, filter.to, dateFormat);

const getRelativeFormFilterRepresentation = (
    filter: IUiRelativeDateFilterForm,
    translator: IDateAndMessageTranslator,
    labelMode: DateFilterLabelMode,
): string =>
    typeof filter.from === "number" && typeof filter.to === "number" && filter.granularity
        ? formatRelativeDateRange(
              filter.from,
              filter.to,
              filter.granularity,
              translator,
              labelMode,
              filter.boundedFilter,
          )
        : "";

const getRelativePresetFilterRepresentation = (
    filter: IRelativeDateFilterPreset,
    translator: IDateAndMessageTranslator,
    labelMode: DateFilterLabelMode,
): string =>
    formatRelativeDateRange(
        filter.from,
        filter.to,
        filter.granularity,
        translator,
        labelMode,
        filter.boundedFilter,
    );

export const getDateFilterRepresentationByFilterType = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    labelMode: DateFilterLabelMode,
) => {
    if (isAbsoluteDateFilterForm(filter) || isRelativeDateFilterForm(filter)) {
        return getDateFilterRepresentationUsingTranslator(filter, translator, dateFormat, labelMode);
    } else if (
        isAllTimeDateFilterOption(filter) ||
        isAbsoluteDateFilterPreset(filter) ||
        isRelativeDateFilterPreset(filter)
    ) {
        return (
            filter.name ||
            getDateFilterRepresentationUsingTranslator(filter, translator, dateFormat, labelMode)
        );
    } else {
        throw new Error("Unknown DateFilterOption type");
    }
};

// excludeCurrentPeriod is extra metadata that is needed by translation, but it is only used by relative filters
// so the data structure is little inconsistent - for example when we translate absoluteForm we need to pass
// excludeCurrentPeriod that is completely unrelated to absolute filter and is not used in absolute translations.
// So in the future, if there will be need for more metadata, consider adding wrapper union type that would wrap
// DateFilterOption along with additional metadata related to given filter. eg.:
// | { filter: IRelativeDateFilterPreset, excludeCurrentPeriod: boolean } |
// | { filter: IAbsoluteFilterForm } |
// ...
/**
 * Gets the filter title using provided intl object.
 * @returns Representation of the filter (e.g. "My preset", "From 2 weeks ago to 1 week ahead")
 */
export const getDateFilterTitleUsingTranslator = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    labelMode: DateFilterLabelMode,
    dateFormat: string = DEFAULT_DATE_FORMAT,
): string => getDateFilterRepresentationByFilterType(filter, translator, dateFormat, labelMode);

/**
 * Gets the filter representation regardless of custom name.
 * @returns Representation of the filter (e.g. "From 2 weeks ago to 1 week ahead")
 */
const getDateFilterRepresentationUsingTranslator = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    labelMode: DateFilterLabelMode,
): string => {
    if (isAbsoluteDateFilterForm(filter)) {
        return getAbsoluteFormFilterRepresentation(filter, dateFormat);
    } else if (isAbsoluteDateFilterPreset(filter)) {
        return getAbsolutePresetFilterRepresentation(filter, dateFormat);
    } else if (isAllTimeDateFilterOption(filter)) {
        return getAllTimeFilterRepresentation(translator);
    } else if (isRelativeDateFilterForm(filter)) {
        return getRelativeFormFilterRepresentation(filter, translator, labelMode);
    } else if (isRelativeDateFilterPreset(filter)) {
        return getRelativePresetFilterRepresentation(filter, translator, labelMode);
    } else {
        throw new Error("Unknown DateFilterOption type");
    }
};

export const getDateFilterRepresentation = (
    filter: DateFilterOption,
    locale: ILocale,
    messages: ITranslations,
    labelMode: DateFilterLabelMode,
    dateFormat: string = DEFAULT_DATE_FORMAT,
): string => {
    const translator = getIntl(locale, messages);

    return getDateFilterRepresentationUsingTranslator(filter, translator, dateFormat, labelMode);
};
