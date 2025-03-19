// (C) 2007-2024 GoodData Corporation
import { granularityIntlCodes } from "./constants/i18n.js";
import { defaultDateFilterOptions } from "./constants/config.js";
import { validateFilterOption } from "./validation/OptionValidation.js";
import { mapOptionToAfm } from "./utils/AFMConversions.js";
import { applyExcludeCurrentPeriod, canExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { filterVisibleDateFilterOptions } from "./utils/OptionUtils.js";
import {
    getDateFilterTitle,
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
    formatAbsoluteDateRange,
    formatRelativeDateRange,
} from "./utils/Translations/DateFilterTitle.js";
export type {
    IDateAndMessageTranslator,
    IDateTranslator,
    IMessageTranslator,
} from "./utils/Translations/Translators.js";
import {
    DateFilter,
    IDateFilterCallbackProps,
    IDateFilterOwnProps,
    IDateFilterProps,
    IDateFilterState,
    IDateFilterStatePropsIntersection,
} from "./DateFilter.js";

/**
 * @beta
 */
const DateFilterHelpers = {
    validateFilterOption,
    getDateFilterTitle,
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
    IDateFilterAbsoluteFormErrors,
    IDateFilterRelativeFormErrors,
    RelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "./interfaces/index.js";
export {
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";

export type { IFilterConfigurationProps } from "./DateFilterBody/types.js";
export { defaultDateFilterOptions } from "./constants/config.js";
export type { GranularityIntlKey } from "./constants/i18n.js";
export { getLocalizedIcuDateFormatPattern } from "./utils/FormattingUtils.js";
