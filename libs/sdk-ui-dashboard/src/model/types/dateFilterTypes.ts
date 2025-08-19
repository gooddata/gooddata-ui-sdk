// (C) 2024-2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";

import { DateFilterGranularity, DateString, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IDashboardDependentDateFilter {
    localIdentifier: string;
    isCommonDate: boolean;
    type: string;
    title?: string;
    isSelected?: boolean;
    dataSet?: ObjRef;
    from?: DateString | number;
    to?: DateString | number;
    granularity?: DateFilterGranularity;
    isDisabled?: boolean;
}

/**
 * Type-guard that tests whether an object is an instance of {@link IDashboardDependentDateFilter}.
 *
 * @param obj - object to test
 * @internal
 */
export function isDashboardDependentDateFilter(obj: unknown): obj is IDashboardDependentDateFilter {
    const w = obj as IDashboardDependentDateFilter;

    return (!isEmpty(w) && w.type === "relative") || w.type === "absolute";
}
