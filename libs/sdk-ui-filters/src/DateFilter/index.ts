// (C) 2007-2021 GoodData Corporation
import { granularityIntlCodes } from "./constants/i18n";
import { defaultDateFilterOptions } from "./constants/config";
import { validateFilterOption } from "./validation/OptionValidation";
import { mapOptionToAfm } from "./utils/AFMConversions";
import { applyExcludeCurrentPeriod, canExcludeCurrentPeriod } from "./utils/PeriodExlusion";
import {
    getDateFilterTitle,
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
    formatAbsoluteDateRange,
    formatRelativeDateRange,
} from "./utils/Translations/DateFilterTitle";
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
};

export {
    AbsoluteDateFilterOption,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "./interfaces";

export { defaultDateFilterOptions } from "./constants/config";
