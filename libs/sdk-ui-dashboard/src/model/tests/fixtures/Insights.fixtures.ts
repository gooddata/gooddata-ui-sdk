// (C) 2021 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedInsight } from "@gooddata/sdk-backend-mockingbird";

export const PivotTableWithRowAndColumnAttributes = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.SingleMeasureWithTwoRowAndTwoColumnAttributes,
);
export const PivotTableWithDateFilter = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithDateFilter,
);
export const PivotTableWithTwoSameDates = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithTwoSameDates,
);
export const TreemapWithSingleMeasureAndViewByFilteredToOneElement = recordedInsight(
    ReferenceRecordings.Insights.Treemap.SingleMeasureAndViewByFilteredToOneElement,
);

export const TreemapWithOneMeasureAndViewByDateAndSegmentByDate = recordedInsight(
    ReferenceRecordings.Insights.Treemap.WithOneMeasureAndViewByDateAndSegmentByDate,
);
