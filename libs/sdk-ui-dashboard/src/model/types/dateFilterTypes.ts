// (C) 2024 GoodData Corporation

import { DateString, ObjRef } from "@gooddata/sdk-model";

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
