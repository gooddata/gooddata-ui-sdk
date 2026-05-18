// (C) 2020-2026 GoodData Corporation

import {
    type ObjRefInScope,
    type SourceInsightFilterObjRef,
    type SourceMeasureFilterObjRef,
} from "@gooddata/sdk-model";

export interface IDrillFiltersConfigOptionDisabled {
    message: string;
    selected: boolean;
}

export interface IDrillFiltersConfigOption {
    id: string;
    title: string;
    disabled?: IDrillFiltersConfigOptionDisabled;
    sourceInsightFilterObjRef?: SourceInsightFilterObjRef;
    sourceMeasureFilterObjRef?: SourceMeasureFilterObjRef;
    metricFilterMeasureRef?: ObjRefInScope;
}

export function isDrillFiltersConfigOptionSelected(
    option: IDrillFiltersConfigOption,
    selectedIds: string[],
): boolean {
    return option.disabled?.selected ?? selectedIds.includes(option.id);
}
