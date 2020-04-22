// (C) 2019-2020 GoodData Corporation
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

export function getDateFilterOptionGranularity(
    dateFilterOption: ExtendedDateFilters.DateFilterOption,
): ExtendedDateFilters.DateFilterGranularity {
    return ExtendedDateFilters.isRelativeDateFilterForm(dateFilterOption) ||
        ExtendedDateFilters.isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
}
