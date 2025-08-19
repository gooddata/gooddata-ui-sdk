// (C) 2007-2025 GoodData Corporation
import {
    IAbsoluteDateFilter,
    IDateFilter,
    IRelativeDateFilter,
    ObjRef,
    isAllTimeDateFilterOption,
} from "@gooddata/sdk-model";

import { applyExcludeCurrentPeriod } from "./PeriodExclusion.js";
import {
    AbsoluteDateFilterOption,
    DateFilterOption,
    RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
} from "../interfaces/index.js";

export const mapAbsoluteFilterToAfm = (
    value: AbsoluteDateFilterOption,
    dataSet: ObjRef,
): IAbsoluteDateFilter => ({
    absoluteDateFilter: {
        dataSet,
        from: value.from,
        to: value.to,
    },
});

export const mapRelativeFilterToAfm = (
    value: RelativeDateFilterOption,
    dataSet: ObjRef,
): IRelativeDateFilter => {
    const { from, to, granularity, boundedFilter } = value;

    return {
        relativeDateFilter: {
            dataSet,
            from,
            to,
            granularity,
            ...(boundedFilter ? { boundedFilter } : {}),
        },
    };
};

export const mapOptionToAfm = (
    value: DateFilterOption,
    dateDataSet: ObjRef,
    excludeCurrentPeriod: boolean,
): IDateFilter => {
    const excludeApplied = applyExcludeCurrentPeriod(value, excludeCurrentPeriod);

    if (isAllTimeDateFilterOption(excludeApplied)) {
        return null;
    }

    if (isAbsoluteDateFilterOption(excludeApplied)) {
        return mapAbsoluteFilterToAfm(excludeApplied, dateDataSet);
    }

    if (isRelativeDateFilterOption(excludeApplied)) {
        return mapRelativeFilterToAfm(excludeApplied, dateDataSet);
    }

    throw new Error("Unknown date filter value provided");
};
