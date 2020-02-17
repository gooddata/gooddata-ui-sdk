// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

export const getDateFilterOptionGranularity = (
    dateFilterOption: ExtendedDateFilters.DateFilterOption,
): ExtendedDateFilters.DateFilterGranularity =>
    ExtendedDateFilters.isRelativeDateFilterForm(dateFilterOption) ||
    ExtendedDateFilters.isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
