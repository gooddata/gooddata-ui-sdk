// (C) 2019-2026 GoodData Corporation

import { format } from "date-fns";
import { capitalize } from "lodash-es";

import {
    type DateFilterGranularity,
    type IAbsoluteDateFilterPreset,
    type ILocale,
    type ILowerBoundedFilter,
    type IRelativeDateFilterPreset,
    type IUpperBoundedFilter,
    type WeekStart,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
    isUpperBound,
} from "@gooddata/sdk-model";
import { type ITranslations, getIntl } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import {
    type DateFilterLabelMode,
    granularityIntlCodes,
    granularityIntlCodesFull,
} from "../../constants/i18n.js";
import { DEFAULT_DATE_FORMAT } from "../../constants/Platform.js";
import {
    type DateFilterOption,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../../interfaces/index.js";
import { convertPlatformDateStringToDate } from "../DateConversions.js";
import { convertLocale } from "../dateFnsLocale.js";
import { DEFAULT_LOCALE, formatAbsoluteDateRange } from "../FormattingUtils.js";
import { getWeekStartDateFnsLocale, resolveWeekStartLocale } from "../weekStartDateFnsLocale.js";

import { type IDateAndMessageTranslator, type IMessageTranslator } from "./Translators.js";

// Intl.DateTimeFormat options for Month/Year period labels; Quarter is handled separately below.
const MONTH_AND_YEAR_INTL_OPTIONS: Partial<Record<DateFilterGranularity, Intl.DateTimeFormatOptions>> = {
    "GDC.time.month": { month: "long", year: "numeric" },
    "GDC.time.year": { year: "numeric" },
};

// Intl.DateTimeFormat has no "quarter" field, so format it with date-fns instead, localized.
const formatQuarterLabel = (date: Date, locale?: string): string =>
    format(date, "QQQ y", { locale: convertLocale(locale) });

// A week's number depends on which day the workspace starts weeks on, so both parts come from a date-fns
// locale carrying that week start. The message places them, so the word and its position stay translatable.
const formatWeekLabel = (date: Date, weekStart: WeekStart, translator: IDateAndMessageTranslator): string => {
    const weekLocale = resolveWeekStartLocale(
        getWeekStartDateFnsLocale(translator.locale ?? DEFAULT_LOCALE, weekStart),
    );

    return translator.formatMessage(
        { id: "filters.staticPeriod.weekLabel" },
        {
            // Strings rather than numbers, so the year does not come back group-separated. "Y" is the
            // week-numbering year, which date-fns guards behind a flag as a likely typo for "y".
            week: format(date, "w", { locale: weekLocale }),
            year: format(date, "Y", { locale: weekLocale, useAdditionalWeekYearTokens: true }),
        },
    );
};

// Week is absent: its label cannot be derived from the date alone, it also needs the week start.
const STATIC_PERIOD_LABEL_GRANULARITIES = new Set<DateFilterGranularity>([
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
]);

const formatMonthQuarterOrYearLabel = (
    date: Date,
    granularity: DateFilterGranularity,
    translator: IDateAndMessageTranslator,
): string => {
    const intlOptions = MONTH_AND_YEAR_INTL_OPTIONS[granularity];
    return intlOptions
        ? translator.formatDate(date, intlOptions)
        : formatQuarterLabel(date, translator.locale);
};

// Formats a static from/to range as period labels, collapsing a single-period range to one label. The
// boundary label is passed in, so a week label can carry the week start the other granularities ignore.
const formatStaticPeriodDateRange = (
    from: string,
    to: string,
    formatPeriodBoundaryLabel: (date: Date) => string,
): string => {
    const fromDate = convertPlatformDateStringToDate(from) ?? undefined;
    const toDate = convertPlatformDateStringToDate(to) ?? undefined;
    if (!fromDate || !toDate) {
        return "";
    }

    const fromLabel = formatPeriodBoundaryLabel(fromDate);
    const toLabel = formatPeriodBoundaryLabel(toDate);
    return fromLabel === toLabel ? fromLabel : `${fromLabel} \u2013 ${toLabel}`;
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

/**
 * @beta
 */
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

const getEmptyValuesFilterRepresentation = (translator: IMessageTranslator): string =>
    translator.formatMessage({ id: "filters.emptyValues.title" });

const getAbsoluteFormFilterRepresentation = (
    filter: IUiAbsoluteDateFilterForm,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    weekStart: WeekStart | undefined,
): string => {
    if (!filter.from || !filter.to) {
        return "";
    }
    const granularity = filter.granularity;
    // Which week a day falls in depends on the workspace's week start, so with none given, fall through to
    // the day range rather than name a week that the rest of the workspace numbers differently.
    if (granularity === "GDC.time.week_us" && weekStart) {
        return formatStaticPeriodDateRange(filter.from, filter.to, (date) =>
            formatWeekLabel(date, weekStart, translator),
        );
    }
    if (granularity && STATIC_PERIOD_LABEL_GRANULARITIES.has(granularity)) {
        return formatStaticPeriodDateRange(filter.from, filter.to, (date) =>
            formatMonthQuarterOrYearLabel(date, granularity, translator),
        );
    }
    return formatAbsoluteDateRange(filter.from, filter.to, dateFormat);
};

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

const getDateFilterRepresentationByFilterType = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    labelMode: DateFilterLabelMode,
    weekStart: WeekStart | undefined,
) => {
    if (isAbsoluteDateFilterForm(filter) || isRelativeDateFilterForm(filter)) {
        return getDateFilterRepresentationUsingTranslator(
            filter,
            translator,
            dateFormat,
            labelMode,
            weekStart,
        );
    } else if (isEmptyValuesDateFilterOption(filter)) {
        return filter.name || getEmptyValuesFilterRepresentation(translator);
    } else if (
        isAllTimeDateFilterOption(filter) ||
        isAbsoluteDateFilterPreset(filter) ||
        isRelativeDateFilterPreset(filter)
    ) {
        return (
            filter.name ||
            getDateFilterRepresentationUsingTranslator(filter, translator, dateFormat, labelMode, weekStart)
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
 *
 * @remarks
 * In addition to the base date filter representation, this function also decorates the title based on
 * empty values handling:
 *
 * - For "All time" with excluded empty values (`emptyValueHandling === "exclude"`), returns
 *   `"All time except empty values"`.
 * - For any non-"All time" option with included empty values (`emptyValueHandling === "include"`), appends
 *   `", empty value"` to the base representation.
 *
 * The dedicated "Empty values" preset is represented by its own title and is not further decorated.
 *
 * @returns Representation of the filter (e.g. "My preset", "From 2 weeks ago to 1 week ahead")
 * @beta
 */
export const getDateFilterTitleUsingTranslator = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    labelMode: DateFilterLabelMode,
    dateFormat: string = DEFAULT_DATE_FORMAT,
    weekStart?: WeekStart,
): string => {
    if (isAllTimeDateFilterOption(filter) && filter.emptyValueHandling === "exclude") {
        return translator.formatMessage({ id: "filters.allTime.exceptEmptyValues.title" });
    }

    const baseTitle = getDateFilterRepresentationByFilterType(
        filter,
        translator,
        dateFormat,
        labelMode,
        weekStart,
    );

    // Special case for that can potentially be persisted but is equal to regular "All time"
    if (isAllTimeDateFilterOption(filter) && filter.emptyValueHandling === "include") {
        return baseTitle;
    }

    if (!isEmptyValuesDateFilterOption(filter) && filter.emptyValueHandling === "include") {
        return translator.formatMessage({ id: "filters.emptyValues.label" }, { title: baseTitle });
    }

    return baseTitle;
};

/**
 * Gets the filter representation regardless of custom name.
 * @returns Representation of the filter (e.g. "From 2 weeks ago to 1 week ahead")
 */
const getDateFilterRepresentationUsingTranslator = (
    filter: DateFilterOption,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    labelMode: DateFilterLabelMode,
    weekStart: WeekStart | undefined,
): string => {
    if (isAbsoluteDateFilterForm(filter)) {
        return getAbsoluteFormFilterRepresentation(filter, translator, dateFormat, weekStart);
    } else if (isAbsoluteDateFilterPreset(filter)) {
        return getAbsolutePresetFilterRepresentation(filter, dateFormat);
    } else if (isAllTimeDateFilterOption(filter)) {
        return getAllTimeFilterRepresentation(translator);
    } else if (isEmptyValuesDateFilterOption(filter)) {
        return getEmptyValuesFilterRepresentation(translator);
    } else if (isRelativeDateFilterForm(filter)) {
        return getRelativeFormFilterRepresentation(filter, translator, labelMode);
    } else if (isRelativeDateFilterPreset(filter)) {
        return getRelativePresetFilterRepresentation(filter, translator, labelMode);
    } else {
        throw new Error("Unknown DateFilterOption type");
    }
};

/**
 * @beta
 */
export const getDateFilterRepresentation = (
    filter: DateFilterOption,
    locale: ILocale,
    messages: ITranslations,
    labelMode: DateFilterLabelMode,
    dateFormat: string = DEFAULT_DATE_FORMAT,
    weekStart?: WeekStart,
): string => {
    const translator = getIntl(locale, messages);

    return getDateFilterRepresentationUsingTranslator(filter, translator, dateFormat, labelMode, weekStart);
};
