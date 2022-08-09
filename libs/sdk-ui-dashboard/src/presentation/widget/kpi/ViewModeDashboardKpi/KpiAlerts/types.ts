// (C) 2020-2021 GoodData Corporation
import { BrokenAlertType } from "../../../../../model";

interface IBrokenAlertFilterBase {
    title: string;
    brokenType: BrokenAlertType;
}

export interface IBrokenAlertAttributeFilter extends IBrokenAlertFilterBase {
    type: "attribute";
    selection: string;
    selectionSize: number;
    isAllSelected: boolean;
}

export interface IBrokenAlertDateFilter extends IBrokenAlertFilterBase {
    type: "date";
    dateFilterTitle: string;
}

export type IBrokenAlertFilter = IBrokenAlertAttributeFilter | IBrokenAlertDateFilter;

export function isBrokenAlertAttributeFilter(obj: unknown): obj is IBrokenAlertAttributeFilter {
    return (obj as IBrokenAlertAttributeFilter)?.type === "attribute";
}

export function isBrokenAlertDateFilter(obj: unknown): obj is IBrokenAlertDateFilter {
    return (obj as IBrokenAlertDateFilter)?.type === "date";
}
