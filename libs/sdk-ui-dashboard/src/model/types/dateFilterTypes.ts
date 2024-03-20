// (C) 2024 GoodData Corporation

import { DateString, ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

/**
 * @internal
 */
export interface IDashboardDependentDateFilter {
    localIdentifier: string;
    isSelected: boolean;
    type: string;
    title?: string;
    dataSet?: ObjRef;
    from?: DateString | number;
    to?: DateString | number;
    granularity?: string;
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
