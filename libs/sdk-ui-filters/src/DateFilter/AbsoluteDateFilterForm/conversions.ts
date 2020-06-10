// (C) 2007-2020 GoodData Corporation

import { IDateRange } from "../DateRangePicker/DateRangePicker";
import { convertDateToPlatformDateString, convertPlatformDateStringToDate } from "../utils/DateConversions";
import { IUiAbsoluteDateFilterForm } from "../interfaces";

export const dateRangeToDateFilterValue = (
    range: IDateRange,
    localIdentifier: string,
): IUiAbsoluteDateFilterForm => ({
    // GD Platform doesn't support time here
    from: convertDateToPlatformDateString(range.from),
    to: convertDateToPlatformDateString(range.to),
    localIdentifier,
    type: "absoluteForm",
    name: "",
    visible: true,
});

export const dateFilterValueToDateRange = (value: IUiAbsoluteDateFilterForm): IDateRange => ({
    from: value && convertPlatformDateStringToDate(value.from),
    to: value && convertPlatformDateStringToDate(value.to),
});
