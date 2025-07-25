// (C) 2021-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InsightRecording, recordedInsight } from "@gooddata/sdk-backend-mockingbird";

export const PivotTableWithRowAndColumnAttributes = recordedInsight(
    ReferenceRecordings.Insights.PivotTable
        .SingleMeasureWithTwoRowAndTwoColumnAttributes as unknown as InsightRecording,
);
export const PivotTableWithDateFilter = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithDateFilter as unknown as InsightRecording,
);
export const PivotTableWithTwoSameDates = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithTwoSameDates as unknown as InsightRecording,
);
export const TreemapWithSingleMeasureAndViewByFilteredToOneElement = recordedInsight(
    ReferenceRecordings.Insights.Treemap
        .SingleMeasureAndViewByFilteredToOneElement as unknown as InsightRecording,
);

export const TreemapWithOneMeasureAndViewByDateAndSegmentByDate = recordedInsight(
    ReferenceRecordings.Insights.Treemap
        .WithOneMeasureAndViewByDateAndSegmentByDate as unknown as InsightRecording,
);
