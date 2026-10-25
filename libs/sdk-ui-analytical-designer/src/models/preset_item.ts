// (C) 2007-2026 GoodData Corporation

import invariant from "invariant";
import { findKey, isEqual, keyBy } from "lodash-es";
import moment from "moment";
import { type IntlShape, defineMessage } from "react-intl";

import {
    type DateFilterGranularity,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
} from "@gooddata/sdk-model";
import { formatRelativeDateRange } from "@gooddata/sdk-ui-filters";
import { DEFAULT_LOCALE } from "@gooddata/sdk-ui-filters/internal";

import {
    ALL_TIME,
    DAY,
    EIGHT_MONTHS_AGO,
    ELEVEN_MONTHS_AGO,
    FISCAL_MONTH,
    FISCAL_QUARTER,
    FISCAL_YEAR,
    FIVE_MONTHS_AGO,
    FIVE_QUARTERS_AGO,
    FIVE_WEEKS_AGO,
    FIVE_YEARS_AGO,
    FOUR_MONTHS_AGO,
    FOUR_QUARTERS_AGO,
    FOUR_WEEKS_AGO,
    FOUR_YEARS_AGO,
    LAST_12_FISCAL_MONTHS,
    LAST_12_MONTHS,
    LAST_2_WEEKS_US,
    LAST_30_DAYS,
    LAST_4_FISCAL_QUARTERS,
    LAST_4_QUARTERS,
    LAST_7_DAYS,
    LAST_90_DAYS,
    LAST_FISCAL_MONTH,
    LAST_FISCAL_QUARTER,
    LAST_FISCAL_YEAR,
    LAST_MONTH,
    LAST_QUARTER,
    LAST_WEEK,
    LAST_WEEK_US,
    LAST_YEAR,
    MONTH,
    NINE_MONTHS_AGO,
    OTHER,
    QUARTER,
    SEVEN_MONTHS_AGO,
    SEVEN_QUARTERS_AGO,
    SEVEN_WEEKS_AGO,
    SIX_MONTHS_AGO,
    SIX_QUARTERS_AGO,
    SIX_WEEKS_AGO,
    STATIC_PERIOD,
    TEN_MONTHS_AGO,
    THIRTEEN_MONTHS_AGO,
    THIS_FISCAL_MONTH,
    THIS_FISCAL_MONTH_TO_DATE,
    THIS_FISCAL_QUARTER,
    THIS_FISCAL_QUARTER_TO_DATE,
    THIS_FISCAL_YEAR,
    THIS_FISCAL_YEAR_TO_DATE,
    THIS_MONTH,
    THIS_MONTH_TO_DATE,
    THIS_QUARTER,
    THIS_QUARTER_TO_DATE,
    THIS_WEEK,
    THIS_WEEK_TO_DATE,
    THIS_WEEK_US,
    THIS_YEAR,
    THIS_YEAR_TO_DATE,
    THREE_MONTHS_AGO,
    THREE_QUARTERS_AGO,
    THREE_WEEKS_AGO,
    THREE_YEARS_AGO,
    TWELVE_MONTHS_AGO,
    TWO_MONTHS_AGO,
    TWO_QUARTERS_AGO,
    TWO_WEEKS_AGO,
    TWO_YEARS_AGO,
    WEEK,
    YEAR,
} from "../constants/presets.js";
import { type IDateFilterConfig } from "../store/filter_bar/filter_bar_types.js";

import { GRANULARITY, GRANULARITY_OPTIONS, type Granularity } from "./granularity.js";

export interface IPresetItem {
    name?: string;
    interval?: [string, string] | [number, number];
    granularity?: Granularity;
    header?: string;
    type?: string;
    today?: string | moment.Moment;
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
}

export const asDateFilterConfig = (preset: IPresetItem): IDateFilterConfig => {
    if (preset === undefined || preset.header !== undefined) {
        return undefined;
    }
    const { name, interval, granularity, boundedFilter } = preset;
    if (preset.name === ALL_TIME) {
        return {
            name,
            granularity,
            interval,
        };
    }
    if (preset.name === STATIC_PERIOD) {
        return {
            type: "absolute",
            name,
            granularity,
            interval,
        };
    }
    return {
        type: "relative",
        name,
        granularity,
        interval,
        ...(boundedFilter ? { boundedFilter } : {}),
    };
};

export const presets: IPresetItem[] = [
    { name: ALL_TIME },
    { name: STATIC_PERIOD, type: "absolute" },
    { header: DAY, granularity: GRANULARITY.DATE },
    { granularity: GRANULARITY.DATE, interval: [-6, 0], name: LAST_7_DAYS },
    { granularity: GRANULARITY.DATE, interval: [-29, 0], name: LAST_30_DAYS },
    { granularity: GRANULARITY.DATE, interval: [-89, 0], name: LAST_90_DAYS },
    { header: WEEK, granularity: GRANULARITY.WEEK },
    { granularity: GRANULARITY.WEEK, interval: [0, 0], name: THIS_WEEK_US },
    { granularity: GRANULARITY.WEEK, interval: [-1, -1], name: LAST_WEEK_US },
    { granularity: GRANULARITY.WEEK, interval: [-1, 0], name: LAST_2_WEEKS_US },
    { header: MONTH, granularity: GRANULARITY.MONTH },
    { granularity: GRANULARITY.MONTH, interval: [0, 0], name: THIS_MONTH },
    { granularity: GRANULARITY.MONTH, interval: [-1, -1], name: LAST_MONTH },
    { granularity: GRANULARITY.MONTH, interval: [-11, 0], name: LAST_12_MONTHS },
    { header: QUARTER, granularity: GRANULARITY.QUARTER },
    { granularity: GRANULARITY.QUARTER, interval: [0, 0], name: THIS_QUARTER },
    { granularity: GRANULARITY.QUARTER, interval: [-1, -1], name: LAST_QUARTER },
    { granularity: GRANULARITY.QUARTER, interval: [-3, 0], name: LAST_4_QUARTERS },
    { header: YEAR, granularity: GRANULARITY.YEAR },
    { granularity: GRANULARITY.YEAR, interval: [0, 0], name: THIS_YEAR },
    { granularity: GRANULARITY.YEAR, interval: [-1, -1], name: LAST_YEAR },
    { header: FISCAL_QUARTER, granularity: GRANULARITY.FISCAL_QUARTER },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [0, 0], name: THIS_FISCAL_QUARTER },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [-1, -1], name: LAST_FISCAL_QUARTER },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [-3, 0], name: LAST_4_FISCAL_QUARTERS },
    { header: FISCAL_MONTH, granularity: GRANULARITY.FISCAL_MONTH },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [0, 0], name: THIS_FISCAL_MONTH },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [-1, -1], name: LAST_FISCAL_MONTH },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [-11, 0], name: LAST_12_FISCAL_MONTHS },
];

const measurePresets: IPresetItem[] = [
    { header: YEAR },
    {
        granularity: GRANULARITY.YEAR,
        interval: [0, 0],
        name: THIS_YEAR_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.YEAR, interval: [0, 0], name: THIS_YEAR },

    { granularity: GRANULARITY.YEAR, interval: [-1, -1], name: LAST_YEAR },
    { granularity: GRANULARITY.YEAR, interval: [-2, -2], name: TWO_YEARS_AGO },
    { granularity: GRANULARITY.YEAR, interval: [-3, -3], name: THREE_YEARS_AGO },
    { granularity: GRANULARITY.YEAR, interval: [-4, -4], name: FOUR_YEARS_AGO },
    { granularity: GRANULARITY.YEAR, interval: [-5, -5], name: FIVE_YEARS_AGO },
    { header: QUARTER },
    {
        granularity: GRANULARITY.QUARTER,
        interval: [0, 0],
        name: THIS_QUARTER_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.QUARTER, interval: [0, 0], name: THIS_QUARTER },

    { granularity: GRANULARITY.QUARTER, interval: [-1, -1], name: LAST_QUARTER },
    { granularity: GRANULARITY.QUARTER, interval: [-2, -2], name: TWO_QUARTERS_AGO },
    { granularity: GRANULARITY.QUARTER, interval: [-3, -3], name: THREE_QUARTERS_AGO },
    { granularity: GRANULARITY.QUARTER, interval: [-4, -4], name: FOUR_QUARTERS_AGO },
    { granularity: GRANULARITY.QUARTER, interval: [-5, -5], name: FIVE_QUARTERS_AGO },
    { granularity: GRANULARITY.QUARTER, interval: [-6, -6], name: SIX_QUARTERS_AGO },
    { granularity: GRANULARITY.QUARTER, interval: [-7, -7], name: SEVEN_QUARTERS_AGO },
    { header: MONTH },
    {
        granularity: GRANULARITY.MONTH,
        interval: [0, 0],
        name: THIS_MONTH_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.MONTH, interval: [0, 0], name: THIS_MONTH },

    { granularity: GRANULARITY.MONTH, interval: [-1, -1], name: LAST_MONTH },
    { granularity: GRANULARITY.MONTH, interval: [-2, -2], name: TWO_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-3, -3], name: THREE_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-4, -4], name: FOUR_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-5, -5], name: FIVE_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-6, -6], name: SIX_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-7, -7], name: SEVEN_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-8, -8], name: EIGHT_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-9, -9], name: NINE_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-10, -10], name: TEN_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-11, -11], name: ELEVEN_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-12, -12], name: TWELVE_MONTHS_AGO },
    { granularity: GRANULARITY.MONTH, interval: [-13, -13], name: THIRTEEN_MONTHS_AGO },
    { header: FISCAL_YEAR },
    {
        granularity: GRANULARITY.FISCAL_YEAR,
        interval: [0, 0],
        name: THIS_FISCAL_YEAR_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.FISCAL_YEAR, interval: [0, 0], name: THIS_FISCAL_YEAR },
    { granularity: GRANULARITY.FISCAL_YEAR, interval: [-1, -1], name: LAST_FISCAL_YEAR },
    { header: FISCAL_QUARTER },
    {
        granularity: GRANULARITY.FISCAL_QUARTER,
        interval: [0, 0],
        name: THIS_FISCAL_QUARTER_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [0, 0], name: THIS_FISCAL_QUARTER },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [-1, -1], name: LAST_FISCAL_QUARTER },
    { granularity: GRANULARITY.FISCAL_QUARTER, interval: [-3, 0], name: LAST_4_FISCAL_QUARTERS },
    { header: FISCAL_MONTH },
    {
        granularity: GRANULARITY.FISCAL_MONTH,
        interval: [0, 0],
        name: THIS_FISCAL_MONTH_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [0, 0], name: THIS_FISCAL_MONTH },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [-1, -1], name: LAST_FISCAL_MONTH },
    { granularity: GRANULARITY.FISCAL_MONTH, interval: [-11, 0], name: LAST_12_FISCAL_MONTHS },
    { header: WEEK },
    {
        granularity: GRANULARITY.WEEK,
        interval: [0, 0],
        name: THIS_WEEK_TO_DATE,
        boundedFilter: { to: 0, granularity: "GDC.time.date" },
    },
    { granularity: GRANULARITY.WEEK, interval: [0, 0], name: THIS_WEEK },

    { granularity: GRANULARITY.WEEK, interval: [-1, -1], name: LAST_WEEK },
    { granularity: GRANULARITY.WEEK, interval: [-2, -2], name: TWO_WEEKS_AGO },
    { granularity: GRANULARITY.WEEK, interval: [-3, -3], name: THREE_WEEKS_AGO },
    { granularity: GRANULARITY.WEEK, interval: [-4, -4], name: FOUR_WEEKS_AGO },
    { granularity: GRANULARITY.WEEK, interval: [-5, -5], name: FIVE_WEEKS_AGO },
    { granularity: GRANULARITY.WEEK, interval: [-6, -6], name: SIX_WEEKS_AGO },
    { granularity: GRANULARITY.WEEK, interval: [-7, -7], name: SEVEN_WEEKS_AGO },
    { header: OTHER },
    { name: STATIC_PERIOD, type: "absolute" },
];

const momentConfigs: Record<string, { abbrev: string; fullName: string; format: string }> = {
    [GRANULARITY.SECOND]: { abbrev: "s", fullName: "second", format: "MMM D, YYYY HH:mm:ss" },
    [GRANULARITY.MINUTE]: { abbrev: "m", fullName: "minute", format: "MMM D, YYYY HH:mm" },
    [GRANULARITY.HOUR]: { abbrev: "h", fullName: "hour", format: "MMM D, YYYY HH:00" },
    [GRANULARITY.DATE]: { abbrev: "d", fullName: "day", format: "MMM D, YYYY" },
    [GRANULARITY.WEEK]: { abbrev: "W", fullName: "week", format: "W, YYYY" },
    [GRANULARITY.MONTH]: { abbrev: "M", fullName: "month", format: "MMM YYYY" },
    [GRANULARITY.FISCAL_MONTH]: { abbrev: "M", fullName: "month", format: "MMM YYYY" },
    [GRANULARITY.QUARTER]: { abbrev: "Q", fullName: "quarter", format: "[Q]Q YYYY" },
    [GRANULARITY.FISCAL_QUARTER]: { abbrev: "Q", fullName: "quarter", format: "[Q]Q YYYY" },
    [GRANULARITY.YEAR]: { abbrev: "y", fullName: "year", format: "YYYY" },
    [GRANULARITY.FISCAL_YEAR]: { abbrev: "y", fullName: "year", format: "YYYY" },
};

const momentLocalizedDateFormatPatterns: Record<string, string> = {
    "en-US": "M/D/Y",
    "en-GB": "DD/MM/Y",
    "cs-CZ": "D. M. Y",
    "de-DE": "D.M.Y",
    "es-ES": "D/M/Y",
    "fr-FR": "DD/MM/Y",
    "ja-JP": "Y/M/D",
    "nl-NL": "D-M-Y",
    "pt-BR": "DD/MM/Y",
    "pt-PT": "DD/MM/Y",
    "zh-Hans": "Y/M/D",
    "ru-RU": "DD.MM.Y",
    "it-IT": "DD/MM/Y",
    "es-419": "D/M/Y",
    "fr-CA": "DD/MM/Y",
    "en-AU": "DD/MM/Y",
    "fi-FI": "D-M-Y",
    "zh-Hant": "Y/M/D",
    "zh-HK": "Y/M/D",
    "tr-TR": "DD.MM.Y",
    "pl-PL": "DD.MM.Y",
    "ko-KR": "Y.MM.DD",
    "sl-SI": "D. M. Y",
};

const getLocalizedDateFormatPattern = (formatLocale: string) =>
    momentLocalizedDateFormatPatterns[formatLocale] ?? momentLocalizedDateFormatPatterns[DEFAULT_LOCALE];

const granularityTranslationKeys: Record<string, string> = {
    SECOND: defineMessage({ id: "date.second" }).id,
    MINUTE: defineMessage({ id: "date.minute" }).id,
    HOUR: defineMessage({ id: "date.hour" }).id,
    DATE: defineMessage({ id: "date.date" }).id,
    WEEK: defineMessage({ id: "date.week" }).id,
    MONTH: defineMessage({ id: "date.month" }).id,
    QUARTER: defineMessage({ id: "date.quarter" }).id,
    YEAR: defineMessage({ id: "date.year" }).id,
    FISCAL_MONTH: defineMessage({ id: "date.fiscal_month" }).id,
    FISCAL_QUARTER: defineMessage({ id: "date.fiscal_quarter" }).id,
    FISCAL_YEAR: defineMessage({ id: "date.fiscal_year" }).id,
};

const intervalTitleIds = {
    single: defineMessage({ id: "date.interval.title.single" }).id,
    range: defineMessage({ id: "date.interval.title.range" }).id,
} as const;

const floatingTitleIds = {
    this: {
        second: defineMessage({ id: "date.floating.title.this.second" }).id,
        minute: defineMessage({ id: "date.floating.title.this.minute" }).id,
        hour: defineMessage({ id: "date.floating.title.this.hour" }).id,
        day: defineMessage({ id: "date.floating.title.this.day" }).id,
        week: defineMessage({ id: "date.floating.title.this.week" }).id,
        month: defineMessage({ id: "date.floating.title.this.month" }).id,
        quarter: defineMessage({ id: "date.floating.title.this.quarter" }).id,
        year: defineMessage({ id: "date.floating.title.this.year" }).id,
        fiscal_month: defineMessage({ id: "date.floating.title.this.fiscal_month" }).id,
        fiscal_quarter: defineMessage({ id: "date.floating.title.this.fiscal_quarter" }).id,
        fiscal_year: defineMessage({ id: "date.floating.title.this.fiscal_year" }).id,
    },
    last: {
        second: defineMessage({ id: "date.floating.title.last.second" }).id,
        minute: defineMessage({ id: "date.floating.title.last.minute" }).id,
        hour: defineMessage({ id: "date.floating.title.last.hour" }).id,
        day: defineMessage({ id: "date.floating.title.last.day" }).id,
        week: defineMessage({ id: "date.floating.title.last.week" }).id,
        month: defineMessage({ id: "date.floating.title.last.month" }).id,
        quarter: defineMessage({ id: "date.floating.title.last.quarter" }).id,
        year: defineMessage({ id: "date.floating.title.last.year" }).id,
        fiscal_month: defineMessage({ id: "date.floating.title.last.fiscal_month" }).id,
        fiscal_quarter: defineMessage({ id: "date.floating.title.last.fiscal_quarter" }).id,
        fiscal_year: defineMessage({ id: "date.floating.title.last.fiscal_year" }).id,
    },
    ago: {
        second: defineMessage({ id: "date.floating.title.ago.second" }).id,
        minute: defineMessage({ id: "date.floating.title.ago.minute" }).id,
        hour: defineMessage({ id: "date.floating.title.ago.hour" }).id,
        day: defineMessage({ id: "date.floating.title.ago.day" }).id,
        week: defineMessage({ id: "date.floating.title.ago.week" }).id,
        month: defineMessage({ id: "date.floating.title.ago.month" }).id,
        quarter: defineMessage({ id: "date.floating.title.ago.quarter" }).id,
        year: defineMessage({ id: "date.floating.title.ago.year" }).id,
    },
} as const;

const floatingThisToDateTitleIds = {
    week: defineMessage({ id: "date.floating.title.this.week_to_date" }).id,
    month: defineMessage({ id: "date.floating.title.this.month_to_date" }).id,
    quarter: defineMessage({ id: "date.floating.title.this.quarter_to_date" }).id,
    year: defineMessage({ id: "date.floating.title.this.year_to_date" }).id,
    fiscal_month: defineMessage({ id: "date.floating.title.this.fiscal_month_to_date" }).id,
    fiscal_quarter: defineMessage({ id: "date.floating.title.this.fiscal_quarter_to_date" }).id,
    fiscal_year: defineMessage({ id: "date.floating.title.this.fiscal_year_to_date" }).id,
} as const;

const getGranularityTranslationKey = (granularity: Granularity) => {
    const granularityKey = findKey(GRANULARITY, (value) => value === granularity);
    invariant(granularityKey, `Not supported granularity value "${granularity}"`);
    return granularityTranslationKeys[granularityKey];
};

const basePresetItem: IPresetItem = {
    header: null,
    name: null,
    granularity: null,
    interval: null,
    today: undefined,
    boundedFilter: null,
};

export function presetItem(options: IPresetItem): IPresetItem {
    return { ...basePresetItem, ...options };
}

export interface IPresetPeriod<T = Date> {
    start: T;
    end: T;
}

export interface IDecoratedPresetItem extends IPresetItem {
    original?: IPresetItem;
    isFloating?: boolean;
    isStatic?: boolean;
    isSingle?: boolean;
    isRange?: boolean;
    template?: string;
    unitCount?: number;
    unitAbbrev?: string;
    unitFullName?: string;
    unitFormat?: string;
    seleniumClass?: string;
}

function getInterval(preset: IPresetItem) {
    const interval = preset.interval || [];
    const isStatic = preset.type === "absolute";
    const isFloating = !isStatic;

    const first = interval[0];
    const second = interval[1];

    const isSingle = first === second;
    const isRange = first !== second;

    return { isFloating, isStatic, isSingle, isRange };
}

function getPronounId(intervalFrom: number, intervalTo: number) {
    if (intervalFrom === 0) {
        return "this";
    }

    if (intervalFrom < -1 && intervalFrom === intervalTo) {
        return "ago";
    }

    return "last";
}

function getTemplate(preset: IDecoratedPresetItem) {
    const header = preset.header;
    if (header) {
        return header;
    }

    const name = preset.name;
    const interval = preset.interval;

    if (!interval) {
        if (name) {
            return name;
        }
        return ALL_TIME;
    }

    if (preset.isStatic) {
        return preset.isRange ? intervalTitleIds.range : intervalTitleIds.single;
    }

    const pronoun = getPronounId(parseInt(interval[0] as string, 10), parseInt(interval[1] as string, 10));

    const granularity = GRANULARITY_OPTIONS.find((item) => {
        return item.dateType === preset.granularity;
    }).label;

    const boundedFilter = preset.boundedFilter;

    // If preset has boundedFilter, it's a "to date" filter
    if (boundedFilter && pronoun === "this") {
        const toDateTitleId =
            floatingThisToDateTitleIds[granularity as keyof typeof floatingThisToDateTitleIds];
        if (toDateTitleId) {
            return toDateTitleId;
        }
    }

    const titleId =
        floatingTitleIds[pronoun as keyof typeof floatingTitleIds]?.[
            granularity as keyof (typeof floatingTitleIds)[keyof typeof floatingTitleIds]
        ];

    if (titleId) {
        return titleId;
    }

    // Fallback to preserve previous behavior for any unexpected combinations.
    return `date.floating.title.${pronoun}.${granularity}`;
}

function getUnitCount(preset: IDecoratedPresetItem) {
    const interval = preset.interval || [];
    const intervalFrom = interval[0] as number;
    const intervalTo = interval[1] as number;

    if (preset.isFloating) {
        if (intervalFrom < 0 && intervalFrom === intervalTo) {
            return intervalFrom * -1;
        }

        return intervalTo - intervalFrom + 1;
    }

    return 0;
}

function getUnitConfig(preset: IDecoratedPresetItem) {
    const config = momentConfigs[preset.granularity || GRANULARITY.DATE];
    return {
        unitAbbrev: config.abbrev,
        unitFullName: config.fullName,
        unitFormat: config.format,
    };
}

function getSeleniumClass(preset: IDecoratedPresetItem) {
    return `s-${preset.name ?? "header"}`;
}

export const LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * -1000 * 60;

function getName(preset: IDecoratedPresetItem): string | undefined {
    return preset.name;
}

function getPeriod(
    preset: IDecoratedPresetItem,
    timezoneOffset = 0,
    localTimezoneOffset = LOCAL_TIMEZONE_OFFSET,
): IPresetPeriod | null {
    const interval = preset.interval;
    if (!interval) {
        return null;
    }

    if (preset.isStatic) {
        return { start: moment(interval[0]).toDate(), end: moment(interval[1]).toDate() };
    }

    const unit = preset.unitAbbrev as moment.unitOfTime.DurationConstructor;
    const today = preset.today;
    const calcDate = (offset: number) =>
        moment(today)
            .add(timezoneOffset - localTimezoneOffset, "ms")
            .add(offset, unit)
            .toDate();

    const from = parseInt(interval[0] as string, 10);
    const to = parseInt(interval[1] as string, 10);

    return { start: calcDate(from), end: calcDate(to) };
}

function getUnitTitle(preset: IDecoratedPresetItem, intl: IntlShape) {
    const count = preset.unitCount;
    const granularity = preset.granularity;

    if (count) {
        return intl.formatMessage({ id: getGranularityTranslationKey(granularity) }, { count });
    }

    return null;
}

function getFormattedPeriod(
    preset: IDecoratedPresetItem,
    timezoneOffset = 0,
    localTimezoneOffset = LOCAL_TIMEZONE_OFFSET,
    formatLocale?: string,
): IPresetPeriod<string> | null {
    const period = getPeriod(preset, timezoneOffset, localTimezoneOffset);
    if (!period) {
        return null;
    }

    // floating does not require date formatting
    const isFloating = preset.isFloating;
    const granularity = preset.granularity;
    if (isFloating && granularity != GRANULARITY.DATE) {
        return null;
    }

    const effectiveDateFormat = formatLocale
        ? getLocalizedDateFormatPattern(formatLocale)
        : preset.unitFormat;

    const calcFormat = (date: moment.MomentInput) => moment(date).format(effectiveDateFormat);

    return { start: calcFormat(period.start), end: calcFormat(period.end) };
}

// The legacy templates word only a range ending at the current period ("This", "Last N") or a single past
// period ("Last", "N ago"). Any other range the metric date filter allows is worded by the SDK, like the
// date filter button does.
function isLegacyTemplateInterval(from: number, to: number) {
    return (to === 0 && from <= 0) || (from === to && from < 0);
}

function getTitle(
    preset: IDecoratedPresetItem,
    intl: IntlShape,
    timezoneOffset = 0,
    localTimezoneOffset = LOCAL_TIMEZONE_OFFSET,
    formatLocale?: string,
) {
    if (preset.isFloating && preset.interval && !preset.header) {
        const from = Number(preset.interval[0]);
        const to = Number(preset.interval[1]);
        if (!isLegacyTemplateInterval(from, to)) {
            return formatRelativeDateRange(
                from,
                to,
                (preset.granularity ?? GRANULARITY.DATE) as DateFilterGranularity,
                intl,
                "full",
                preset.boundedFilter ?? undefined,
            );
        }
    }

    const template = preset.template;

    if (template) {
        const formattedPeriod = getFormattedPeriod(preset, timezoneOffset, localTimezoneOffset, formatLocale);

        return intl.formatMessage(
            { id: template },
            {
                unitCount: preset.unitCount,
                unitTitle: getUnitTitle(preset, intl),
                periodStart: formattedPeriod?.start,
                periodEnd: formattedPeriod?.end,
            },
        );
    }
    return null;
}

function getPickerInterval(
    preset: IDecoratedPresetItem,
    timezoneOffset = 0,
    localTimezoneOffset = LOCAL_TIMEZONE_OFFSET,
): IPresetPeriod | null {
    const period = getPeriod(preset, timezoneOffset, localTimezoneOffset);
    if (!period) {
        return null;
    }

    const unitFullName = preset.unitFullName as moment.unitOfTime.StartOf;
    const calcDate = (date: Date, method: "startOf" | "endOf") => moment(date)[method](unitFullName).toDate();

    return { start: calcDate(period.start, "startOf"), end: calcDate(period.end, "endOf") };
}

export const DecoratedPresetItem = {
    getName,
    getPeriod,
    getUnitTitle,
    getFormattedPeriod,
    getTitle,
    getPickerInterval,
};

export function createDecoratedPresetItem(preset: IPresetItem | unknown): IDecoratedPresetItem {
    const plain: IPresetItem = preset as IPresetItem;

    const withFlags: IDecoratedPresetItem = { ...plain, original: plain, ...getInterval(plain) };
    // template/unitCount read the interval flags, so they are computed on the flagged item
    const withTemplate: IDecoratedPresetItem = {
        ...withFlags,
        template: getTemplate(withFlags),
        unitCount: getUnitCount(withFlags),
    };

    return {
        ...withTemplate,
        ...getUnitConfig(withTemplate),
        seleniumClass: getSeleniumClass(withTemplate),
    };
}

export const PRESETS: IDecoratedPresetItem[] = presets.map((preset) => createDecoratedPresetItem(preset));

export const MEASURE_DATE_FILTER_PRESETS: IDecoratedPresetItem[] = measurePresets.map((preset) =>
    createDecoratedPresetItem(preset),
);

export const PRESETS_BY_NAME: Record<string, IDecoratedPresetItem> = keyBy(
    PRESETS.filter((preset) => preset.name),
    "name",
);

export function getGranularityPresets(name: string) {
    return presets.find((preset) => preset.name === name);
}

export function getDateFilterConfigFromPreset(name: string): IDateFilterConfig {
    const { interval, granularity } = getGranularityPresets(name);
    return {
        name,
        interval,
        granularity,
    };
}

function matchAllTime(firstPreset: IDecoratedPresetItem, secondPreset: IDecoratedPresetItem) {
    return (
        !firstPreset.isStatic &&
        !secondPreset.isStatic &&
        !firstPreset.interval &&
        !secondPreset.interval &&
        !firstPreset.granularity &&
        !secondPreset.granularity
    );
}

function matchStaticPeriod(firstPreset: IDecoratedPresetItem, secondPreset: IDecoratedPresetItem) {
    return firstPreset.isStatic && secondPreset.isStatic;
}

function matchRelativePreset(firstPreset: IDecoratedPresetItem, secondPreset: IDecoratedPresetItem) {
    const sameInterval = firstPreset.interval && isEqual(firstPreset.interval, secondPreset.interval);

    const sameGranularity = firstPreset.granularity && firstPreset.granularity === secondPreset.granularity;

    // Compare boundedFilter to distinguish between regular filters and "to date" filters
    const sameBoundedFilter = isEqual(firstPreset.boundedFilter, secondPreset.boundedFilter);

    return sameInterval && sameGranularity && sameBoundedFilter;
}

export function arePresetsEqual(firstPreset: IDecoratedPresetItem, secondPreset: IDecoratedPresetItem) {
    return (
        !!firstPreset &&
        !!(
            matchAllTime(firstPreset, secondPreset) ||
            matchStaticPeriod(firstPreset, secondPreset) ||
            matchRelativePreset(firstPreset, secondPreset)
        )
    );
}
