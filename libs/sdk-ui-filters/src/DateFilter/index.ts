// (C) 2007-2025 GoodData Corporation

import { defaultDateFilterOptions } from "./constants/config.js";
import { granularityIntlCodes } from "./constants/i18n.js";
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
export { DateFilter, DateFilterHelpers, filterVisibleDateFilterOptions };

export type {
    AbsoluteDateFilterOption,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IDateFilterRelativeFormErrors,
    RelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    DateRangePosition,
    IDateFilterAbsoluteDateTimeFormErrors,
} from "./interfaces/index.js";
export {
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isRelativeDateFilterWithBoundOption,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";

export type { IFilterConfigurationProps } from "./DateFilterBody/types.js";
export { defaultDateFilterOptions } from "./constants/config.js";
export type { GranularityIntlKey } from "./constants/i18n.js";
export { getLocalizedIcuDateFormatPattern } from "./utils/FormattingUtils.js";
export type { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
