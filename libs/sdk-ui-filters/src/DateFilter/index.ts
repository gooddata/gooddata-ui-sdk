// (C) 2007-2022 GoodData Corporation
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
export {
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
export {
    DateFilter,
    IDateFilterCallbackProps,
    IDateFilterOwnProps,
    IDateFilterProps,
    IDateFilterState,
    DateFilterHelpers,
    IDateFilterStatePropsIntersection,
    filterVisibleDateFilterOptions,
};

export {
    AbsoluteDateFilterOption,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IDateFilterAbsoluteFormErrors,
    IDateFilterRelativeFormErrors,
    RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";

export { defaultDateFilterOptions } from "./constants/config.js";
export { GranularityIntlKey } from "./constants/i18n.js";
export { getLocalizedIcuDateFormatPattern } from "./utils/FormattingUtils.js";
