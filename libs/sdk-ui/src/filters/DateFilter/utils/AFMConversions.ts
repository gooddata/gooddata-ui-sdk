// (C) 2007-2019 GoodData Corporation
import { IAbsoluteDateFilter, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
import { applyExcludeCurrentPeriod } from "./PeriodExlusion";
import DateFilterOption = ExtendedDateFilters.DateFilterOption;
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

export const mapAbsoluteFilterToAfm = (
    value: ExtendedDateFilters.AbsoluteDateFilterOption,
    dataSet: ObjRef,
): IAbsoluteDateFilter => ({
    absoluteDateFilter: {
        dataSet,
        from: value.from,
        to: value.to,
    },
});

export const mapRelativeFilterToAfm = (
    value: ExtendedDateFilters.RelativeDateFilterOption,
    dataSet: ObjRef,
): IRelativeDateFilter => ({
    relativeDateFilter: {
        dataSet,
        from: value.from,
        to: value.to,
        granularity: value.granularity,
    },
});

export const mapOptionToAfm = (
    value: DateFilterOption,
    dateDataSet: ObjRef,
    excludeCurrentPeriod: boolean,
) => {
    const excludeApplied = applyExcludeCurrentPeriod(value, excludeCurrentPeriod);

    if (ExtendedDateFilters.isAllTimeDateFilter(excludeApplied)) {
        return null;
    }

    if (ExtendedDateFilters.isAbsoluteDateFilterOption(excludeApplied)) {
        return mapAbsoluteFilterToAfm(excludeApplied, dateDataSet);
    }

    if (ExtendedDateFilters.isRelativeDateFilterOption(excludeApplied)) {
        return mapRelativeFilterToAfm(excludeApplied, dateDataSet);
    }

    throw new Error("Uknown date filter value provided");
};
