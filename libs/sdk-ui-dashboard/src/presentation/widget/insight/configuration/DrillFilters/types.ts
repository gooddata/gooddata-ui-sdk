// (C) 2020-2026 GoodData Corporation

import { type SourceInsightFilterObjRef, type SourceMeasureFilterObjRef } from "@gooddata/sdk-model";

export interface IDrillFiltersConfigOption {
    id: string;
    title: string;
    sourceInsightFilterObjRef?: SourceInsightFilterObjRef;
    sourceMeasureFilterObjRef?: SourceMeasureFilterObjRef;
}
