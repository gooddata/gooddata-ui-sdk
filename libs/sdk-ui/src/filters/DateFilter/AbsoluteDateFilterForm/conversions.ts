// (C) 2007-2019 GoodData Corporation

import { IDateRange } from "../DateRangePicker/DateRangePicker";
import { convertDateToPlatformDateString, convertPlatformDateStringToDate } from "../utils/DateConversions";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

export const dateRangeToDateFilterValue = (
    range: IDateRange,
    localIdentifier: string,
): ExtendedDateFilters.IAbsoluteDateFilterForm => ({
    // GD Platform doesn't support time here
    from: convertDateToPlatformDateString(range.from),
    to: convertDateToPlatformDateString(range.to),
    localIdentifier,
    type: "absoluteForm",
    name: "",
    visible: true,
});

export const dateFilterValueToDateRange = (
    value: ExtendedDateFilters.IAbsoluteDateFilterForm,
): IDateRange => ({
    from: value && convertPlatformDateStringToDate(value.from),
    to: value && convertPlatformDateStringToDate(value.to),
});
