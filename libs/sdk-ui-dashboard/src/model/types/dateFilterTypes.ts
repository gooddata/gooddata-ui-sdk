// (C) 2024-2026 GoodData Corporation

import { type DateFilterGranularity, type DateString, type ObjRef } from "@gooddata/sdk-model";
import { _isEmpty } from "@gooddata/util";

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

    return (!_isEmpty(w) && w.type === "relative") || w.type === "absolute";
}
