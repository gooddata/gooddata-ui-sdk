// (C) 2007-2026 GoodData Corporation

import { defaultDateFilterOptions } from "./constants/config.js";
import { type DateFilterLabelMode, type GranularityIntlKey, granularityIntlCodes } from "./constants/i18n.js";
import {
    DateFilter,
    type IDateFilterCallbackProps,
    type IDateFilterOwnProps,
    type IDateFilterProps,
    type IDateFilterState,
    type IDateFilterStatePropsIntersection,
} from "./DateFilter.js";
import { mapOptionToAfm } from "./utils/AFMConversions.js";
import { filterVisibleDateFilterOptions } from "./utils/OptionUtils.js";
import { applyExcludeCurrentPeriod, canExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import {
    formatAbsoluteDateRange,
    formatRelativeDateRange,
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
} from "./utils/Translations/DateFilterTitle.js";
import { validateFilterOption } from "./validation/OptionValidation.js";
export type {
    IDateAndMessageTranslator,
    IDateTranslator,
    IMessageTranslator,
} from "./utils/Translations/Translators.js";

/**
 * @beta
 */
const DateFilterHelpers = {
    validateFilterOption,
    getDateFilterTitleUsingTranslator,
    getDateFilterRepresentation,
    granularityIntlCodes,
    applyExcludeCurrentPeriod,
    defaultDateFilterOptions,
    canExcludeCurrentPeriod,
    mapOptionToAfm,
    formatAbsoluteDateRange,
    formatRelativeDateRange,
    filterVisibleDateFilterOptions,
};

// This is 1:1 reexported by root index.ts and is part of SDK's public API
export type {
    IDateFilterCallbackProps,
    IDateFilterOwnProps,
    IDateFilterProps,
    IDateFilterState,
    IDateFilterStatePropsIntersection,
};
export { DateFilter, DateFilterHelpers, filterVisibleDateFilterOptions, defaultDateFilterOptions };
export type { GranularityIntlKey, DateFilterLabelMode };

export {
    type AbsoluteDateFilterOption,
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
    type IDateFilterRelativeFormErrors,
    type RelativeDateFilterOption,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
    type DateRangePosition,
    type IDateFilterAbsoluteDateTimeFormErrors,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isRelativeDateFilterWithBoundOption,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";

export type { IFilterConfigurationProps } from "./DateFilterBody/types.js";
export { getLocalizedIcuDateFormatPattern } from "./utils/FormattingUtils.js";
export type { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";

export {
    type CalendarTabType,
    type IFiscalTabsConfig,
    type IUiRelativeDateFilterFormLike,
    getFiscalTabsConfig,
    getDefaultCalendarTab,
    getFilteredPresets,
    getFilteredGranularities,
    hasFiscalPresets,
    hasStandardPresets,
    filterStandardPresets,
    filterFiscalPresets,
    filterStandardGranularities,
    filterFiscalGranularities,
    getTabForPreset,
    isFiscalGranularity,
    ensureCompatibleGranularity,
} from "./utils/presetFilterUtils.js";
