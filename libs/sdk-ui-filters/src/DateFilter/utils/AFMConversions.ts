// (C) 2007-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter,
    type IAbsoluteGranularityDateFilter,
    type IDateFilter,
    type IRelativeDateFilter,
    type ObjRef,
    isAbsoluteDateFilterForm,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
} from "@gooddata/sdk-model";

import {
    type AbsoluteDateFilterOption,
    type DateFilterOption,
    type IUiAbsoluteGranularityDateFilterForm,
    type RelativeDateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isUiAbsoluteGranularityDateFilterForm,
} from "../interfaces/index.js";

import { applyExcludeCurrentPeriod } from "./PeriodExclusion.js";

export const mapAbsoluteFilterToAfm = (
    value: AbsoluteDateFilterOption,
    dataSet: ObjRef,
): IAbsoluteDateFilter =>
    newAbsoluteDateFilter(dataSet, value.from ?? "", value.to ?? "", {
        granularity: isAbsoluteDateFilterForm(value) ? value.granularity : undefined,
    });

export const mapAbsoluteGranularityFilterToAfm = (
    { granularity, from, to }: IUiAbsoluteGranularityDateFilterForm,
    dataSet: ObjRef,
): IAbsoluteGranularityDateFilter | null => {
    if (from !== undefined) {
        return newAbsoluteGranularityDateFilter(dataSet, granularity, from, to);
    }
    if (to !== undefined) {
        return newAbsoluteGranularityDateFilter(dataSet, granularity, undefined, to);
    }
    // a form without bounds selects no range
    return null;
};

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

/**
 * Converts a date filter option to an AFM date filter.
 *
 * @remarks
 * Returns null for an option that selects no range: All time, empty values, and the absolute form with
 * granularity without bounds.
 *
 * @beta
 */
export const mapOptionToAfm = (
    value: DateFilterOption,
    dateDataSet: ObjRef,
    excludeCurrentPeriod: boolean,
): IDateFilter | IAbsoluteGranularityDateFilter | null => {
    const excludeApplied = applyExcludeCurrentPeriod(value, excludeCurrentPeriod);

    if (isAllTimeDateFilterOption(excludeApplied) || isEmptyValuesDateFilterOption(excludeApplied)) {
        return null;
    }

    if (isAbsoluteDateFilterOption(excludeApplied)) {
        return mapAbsoluteFilterToAfm(excludeApplied, dateDataSet);
    }

    if (isUiAbsoluteGranularityDateFilterForm(excludeApplied)) {
        return mapAbsoluteGranularityFilterToAfm(excludeApplied, dateDataSet);
    }

    if (isRelativeDateFilterOption(excludeApplied)) {
        return mapRelativeFilterToAfm(excludeApplied, dateDataSet);
    }

    throw new Error("Unknown date filter value provided");
};
