// (C) 2007-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter,
    type IDateFilter,
    type IRelativeDateFilter,
    type ObjRef,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
} from "@gooddata/sdk-model";

import { applyExcludeCurrentPeriod } from "./PeriodExclusion.js";
import {
    type AbsoluteDateFilterOption,
    type DateFilterOption,
    type RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
} from "../interfaces/index.js";

export const mapAbsoluteFilterToAfm = (
    value: AbsoluteDateFilterOption,
    dataSet: ObjRef,
): IAbsoluteDateFilter => ({
    absoluteDateFilter: {
        dataSet,
        from: value.from ?? "",
        to: value.to ?? "",
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
            from: from ?? 0,
            to: to ?? 0,
            granularity: granularity ?? "GDC.time.date",
            ...(boundedFilter ? { boundedFilter } : {}),
        },
    };
};

export const mapOptionToAfm = (
    value: DateFilterOption,
    dateDataSet: ObjRef,
    excludeCurrentPeriod: boolean,
): IDateFilter | null => {
    const excludeApplied = applyExcludeCurrentPeriod(value, excludeCurrentPeriod);

    if (isAllTimeDateFilterOption(excludeApplied) || isEmptyValuesDateFilterOption(excludeApplied)) {
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
