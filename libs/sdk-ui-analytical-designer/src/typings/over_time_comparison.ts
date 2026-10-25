// (C) 2007-2026 GoodData Corporation

import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

export interface IOverTimeComparisonSummary {
    type: OverTimeComparisonType;
    compatibleMeasuresCount: number;
    selectedMeasuresCount: number;
}
