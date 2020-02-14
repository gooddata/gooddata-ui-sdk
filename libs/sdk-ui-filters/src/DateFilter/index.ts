// (C) 2007-2019 GoodData Corporation
import { granularityIntlCodes } from "./constants/i18n";
import { defaultDateFilterOptions } from "./constants/config";
import { validateFilterOption } from "./validation/OptionValidation";
import { mapOptionToAfm } from "./utils/AFMConversions";
import { applyExcludeCurrentPeriod, canExcludeCurrentPeriod } from "./utils/PeriodExlusion";
import {
    getDateFilterTitle,
    getDateFilterRepresentation,
    getDateFilterTitleUsingTranslator,
} from "./utils/Translations/DateFilterTitle";
import { DateFilter, IDateFilterCallbackProps, IDateFilterOwnProps, IDateFilterProps } from "./DateFilter";

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
};

// This is 1:1 reexported by root index.ts and is part of SDK's public API
export { DateFilter, IDateFilterCallbackProps, IDateFilterOwnProps, IDateFilterProps, DateFilterHelpers };

export { ExtendedDateFilters } from "./interfaces/ExtendedDateFilters";

export { defaultDateFilterOptions } from "./constants/config";
