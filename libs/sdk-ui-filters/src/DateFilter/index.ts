// (C) 2007-2026 GoodData Corporation

import { defaultDateFilterOptions } from "./constants/config.js";
import { granularityIntlCodes } from "./constants/i18n.js";
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

/**
 * @beta
 */
export const DateFilterHelpers = {
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
