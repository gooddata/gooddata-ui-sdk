// (C) 2007-2022 GoodData Corporation
import { granularityIntlCodes } from "./constants/i18n";
import { defaultDateFilterOptions } from "./constants/config";
import { validateFilterOption } from "./validation/OptionValidation";
import { mapOptionToAfm } from "./utils/AFMConversions";
import { applyExcludeCurrentPeriod, canExcludeCurrentPeriod } from "./utils/PeriodExclusion";
import { filterVisibleDateFilterOptions } from "./utils/OptionUtils";
import {
    getDateFilterTitle,
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
    formatAbsoluteDateRange,
    formatRelativeDateRange,
} from "./utils/Translations/DateFilterTitle";
export {
    IDateAndMessageTranslator,
    IDateTranslator,
    IMessageTranslator,
} from "./utils/Translations/Translators";
import {
    DateFilter,
    IDateFilterCallbackProps,
    IDateFilterOwnProps,
    IDateFilterProps,
    IDateFilterState,
    IDateFilterStatePropsIntersection,
} from "./DateFilter";

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
} from "./interfaces";

export { defaultDateFilterOptions } from "./constants/config";
export { GranularityIntlKey } from "./constants/i18n";
export { getLocalizedIcuDateFormatPattern } from "./utils/FormattingUtils";
