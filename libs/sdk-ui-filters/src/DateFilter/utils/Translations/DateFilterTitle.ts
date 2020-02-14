// (C) 2019 GoodData Corporation
import capitalize = require("lodash/capitalize");
import isEqual = require("lodash/isEqual");
import { ILocale, getIntl } from "@gooddata/sdk-ui";
import { granularityIntlCodes } from "../../constants/i18n";
import { IMessageTranslator, IDateTranslator, IDateAndMessageTranslator } from "./Translators";
import { convertPlatformDateStringToDate } from "../DateConversions";
import { ExtendedDateFilters } from "../../interfaces/ExtendedDateFilters";

const formatAbsoluteDate = (date: Date | string, translator: IDateTranslator) =>
    translator.formatDate(date, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

const formatAbsoluteDateRange = (
    from: Date | string,
    to: Date | string,
    translator: IDateTranslator,
): string => {
    const fromDate = convertPlatformDateStringToDate(from);
    const toDate = convertPlatformDateStringToDate(to);
    const fromTitle = formatAbsoluteDate(fromDate, translator);
    const toTitle = formatAbsoluteDate(toDate, translator);

    if (isEqual(fromTitle, toTitle)) {
        return fromTitle;
    }

    return `${fromTitle}\u2013${toTitle}`;
};

const relativeDateRangeFormatters: Array<{
    predicate: (from: number, to: number) => boolean;
    formatter: (
        from: number,
        to: number,
        intlGranularity: string,
        translator: IDateAndMessageTranslator,
    ) => string;
}> = [
    {
        // Today, This month
        predicate: (from, to) => from === 0 && to === 0,
        formatter: (_from, _to, intlGranularity, translator) =>
            translator.formatMessage({ id: `filters.this${capitalize(intlGranularity)}.title` }),
    },
    {
        // Tomorrow, Next month
        predicate: (from, to) => from === 1 && to === 1,
        formatter: (_from, _to, intlGranularity, translator) =>
            translator.formatMessage({ id: `filters.next${capitalize(intlGranularity)}.title` }),
    },
    {
        // Yesterday, Last month
        predicate: (from, to) => from === -1 && to === -1,
        formatter: (_from, _to, intlGranularity, translator) =>
            translator.formatMessage({ id: `filters.last${capitalize(intlGranularity)}.title` }),
    },
    {
        // Next N days (months)
        predicate: from => from === 0,
        formatter: (_from, to, intlGranularity, translator) =>
            translator.formatMessage(
                { id: `filters.nextN${capitalize(intlGranularity)}s` },
                { n: Math.abs(to) + 1 },
            ),
    },
    {
        // Last N days (months)
        predicate: (_from, to) => to === 0,
        formatter: (from, _to, intlGranularity, translator) =>
            translator.formatMessage(
                { id: `filters.lastN${capitalize(intlGranularity)}s` },
                { n: Math.abs(from) + 1 },
            ),
    },
    {
        // From N days ago to M days ago
        predicate: (from, to) => from < 0 && to < 0,
        formatter: (from, to, intlGranularity, translator) =>
            translator.formatMessage(
                { id: `filters.interval.${intlGranularity}s.past` },
                {
                    from: Math.abs(from),
                    to: Math.abs(to),
                },
            ),
    },
    {
        // From N days ahead to M days ahead
        predicate: (from, to) => from > 0 && to > 0,
        formatter: (from, to, intlGranularity, translator) =>
            translator.formatMessage(
                { id: `filters.interval.${intlGranularity}s.future` },
                {
                    from: Math.abs(from),
                    to: Math.abs(to),
                },
            ),
    },
    {
        // From N days ago to M days ahead
        predicate: () => true,
        formatter: (from, to, intlGranularity, translator) =>
            translator.formatMessage(
                { id: `filters.interval.${intlGranularity}s.mixed` },
                {
                    from: Math.abs(from),
                    to: Math.abs(to),
                },
            ),
    },
];

const formatRelativeDateRange = (
    from: number,
    to: number,
    granularity: ExtendedDateFilters.DateFilterGranularity,
    translator: IDateAndMessageTranslator,
): string => {
    const intlGranularity = granularityIntlCodes[granularity];
    const { formatter } = relativeDateRangeFormatters.find(f => f.predicate(from, to));
    return formatter(from, to, intlGranularity, translator);
};

const getAllTimeFilterRepresentation = (translator: IMessageTranslator): string =>
    translator.formatMessage({ id: "filters.allTime.title" });

const getAbsoluteFormFilterRepresentation = (
    filter: ExtendedDateFilters.IAbsoluteDateFilterForm,
    translator: IDateAndMessageTranslator,
): string => (filter.from && filter.to ? formatAbsoluteDateRange(filter.from, filter.to, translator) : "");

const getAbsolutePresetFilterRepresentation = (
    filter: ExtendedDateFilters.IAbsoluteDateFilterPreset,
    translator: IDateAndMessageTranslator,
): string => formatAbsoluteDateRange(filter.from, filter.to, translator);

const getRelativeFormFilterRepresentation = (
    filter: ExtendedDateFilters.IRelativeDateFilterForm,
    translator: IDateAndMessageTranslator,
): string =>
    typeof filter.from === "number" && typeof filter.to === "number"
        ? formatRelativeDateRange(filter.from, filter.to, filter.granularity, translator)
        : "";

const getRelativePresetFilterRepresentation = (
    filter: ExtendedDateFilters.IRelativeDateFilterPreset,
    translator: IDateAndMessageTranslator,
): string => formatRelativeDateRange(filter.from, filter.to, filter.granularity, translator);

const getDateFilterRepresentationByFilterType = (
    filter: ExtendedDateFilters.DateFilterOption,
    translator: IDateAndMessageTranslator,
) => {
    if (
        ExtendedDateFilters.isAbsoluteDateFilterForm(filter) ||
        ExtendedDateFilters.isRelativeDateFilterForm(filter)
    ) {
        return getDateFilterRepresentationUsingTranslator(filter, translator);
    } else if (
        ExtendedDateFilters.isAllTimeDateFilter(filter) ||
        ExtendedDateFilters.isAbsoluteDateFilterPreset(filter) ||
        ExtendedDateFilters.isRelativeDateFilterPreset(filter)
    ) {
        return filter.name || getDateFilterRepresentationUsingTranslator(filter, translator);
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
 * Gets the filter title favoring custom name if specified.
 * @returns {string} Representation of the filter (e.g. "My preset", "From 2 weeks ago to 1 week ahead")
 */
export const getDateFilterTitle = (filter: ExtendedDateFilters.DateFilterOption, locale: ILocale): string => {
    const translator = getIntl(locale);

    return getDateFilterRepresentationByFilterType(filter, translator);
};

/**
 * Gets the filter title favoring custom name if specified. This function is only for mock purpose.
 * @returns {string} Representation of the filter (e.g. "My preset", "From 2 weeks ago to 1 week ahead")
 */
export const getDateFilterTitleUsingTranslator = (
    filter: ExtendedDateFilters.DateFilterOption,
    translator: IDateAndMessageTranslator,
): string => getDateFilterRepresentationByFilterType(filter, translator);

/**
 * Gets the filter representation regardless of custom name.
 * @returns {string} Representation of the filter (e.g. "From 2 weeks ago to 1 week ahead")
 */
const getDateFilterRepresentationUsingTranslator = (
    filter: ExtendedDateFilters.DateFilterOption,
    translator: IDateAndMessageTranslator,
): string => {
    if (ExtendedDateFilters.isAbsoluteDateFilterForm(filter)) {
        return getAbsoluteFormFilterRepresentation(filter, translator);
    } else if (ExtendedDateFilters.isAbsoluteDateFilterPreset(filter)) {
        return getAbsolutePresetFilterRepresentation(filter, translator);
    } else if (ExtendedDateFilters.isAllTimeDateFilter(filter)) {
        return getAllTimeFilterRepresentation(translator);
    } else if (ExtendedDateFilters.isRelativeDateFilterForm(filter)) {
        return getRelativeFormFilterRepresentation(filter, translator);
    } else if (ExtendedDateFilters.isRelativeDateFilterPreset(filter)) {
        return getRelativePresetFilterRepresentation(filter, translator);
    } else {
        throw new Error("Unknown DateFilterOption type");
    }
};

export const getDateFilterRepresentation = (
    filter: ExtendedDateFilters.DateFilterOption,
    locale: ILocale,
): string => {
    const translator = getIntl(locale);

    return getDateFilterRepresentationUsingTranslator(filter, translator);
};
