// (C) 2007-2026 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { type LegacyExecutionRecording, localLegacyDataView } from "./legacyDataView.js";
import { recordedDataFacade } from "./recordings.js";
import {
    AreaChartWith3MetricsAndViewByAttribute,
    BarChartWith3MetricsAndViewByAttribute,
    BarChartWith3MetricsAndViewByAttributeFunformat,
    BarChartWith3MetricsAndViewByAttributePercInFormat,
    BarChartWith4MetricsAndViewByTwoAttributes,
    BarChartWithPopMeasureAndViewByAttribute,
    BarChartWithPopMeasureAndViewByAttributeX6,
    BarChartWithPreviousPeriodMeasure,
    BarChartWithPreviousPeriodMeasureX6,
    BubbleChartWith3MetricsAndAttributeNullsInData,
    ComboChartWithTwoMeasuresViewByAttribute,
    ComboChartWithTwoMeasuresViewByAttributeNoBuckets,
    ComboChartWithTwoMeasuresViewByAttributePercformat,
    HeadlineWithTwoMeasuresBothEmpty,
    HeadlineWithTwoMeasuresBothSame,
    HeadlineWithTwoMeasuresBothZero,
    HeadlineWithTwoMeasuresFirstEmpty,
    HeadlineWithTwoMeasuresFirstZero,
    HeadlineWithTwoMeasuresSecondEmpty,
    HeadlineWithTwoMeasuresSecondZero,
    PieChartWithMetricsOnly,
    PieChartWithMetricsOnlyFundata,
    ScatterPlotWith2MetricsAndAttributeNullsInData,
} from "./recordings/playlist.js";

function legacyRecordedDataFacade(recording: LegacyExecutionRecording): DataViewFacade {
    return DataViewFacade.for(localLegacyDataView(recording));
}

//
// new fixtures
//

export const testWorkspace = "testWorkspace";

//
// Area chart fixtures
//

export const areaChartWith3MetricsAndViewByAttribute = legacyRecordedDataFacade(
    AreaChartWith3MetricsAndViewByAttribute,
);

export const areaChartWithMeasureViewByAndStackBy = recordedDataFacade(
    ReferenceRecordings.Scenarios.AreaChart.SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
);

//
// Bar chart fixtures
//

export const barChartWith4MetricsAndViewByTwoAttributes = legacyRecordedDataFacade(
    BarChartWith4MetricsAndViewByTwoAttributes,
);
export const barChartWithStackByAndViewByAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
);
export const barChartWithViewByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy as unknown as ScenarioRecording,
);

export const barChartWith3MetricsAndViewByAttribute = legacyRecordedDataFacade(
    BarChartWith3MetricsAndViewByAttribute,
);
export const barChartWith3MetricsAndViewByAttributeFunformat = legacyRecordedDataFacade(
    BarChartWith3MetricsAndViewByAttributeFunformat,
);

export const barChartWith3MetricsAndViewByAttributePercInFormat = legacyRecordedDataFacade(
    BarChartWith3MetricsAndViewByAttributePercInFormat,
);

export const barChartWithPopMeasureAndViewByAttribute = legacyRecordedDataFacade(
    BarChartWithPopMeasureAndViewByAttribute,
);

export const barChartWithPopMeasureAndViewByAttributeX6 = legacyRecordedDataFacade(
    BarChartWithPopMeasureAndViewByAttributeX6,
);

export const barChartWithPreviousPeriodMeasure = legacyRecordedDataFacade(BarChartWithPreviousPeriodMeasure);
export const barChartWithSingleMeasureAndNoAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasure as unknown as ScenarioRecording,
);

export const barChartWithPreviousPeriodMeasureX6 = legacyRecordedDataFacade(
    BarChartWithPreviousPeriodMeasureX6,
);

//
// Bubble chart
//
export const bubbleChartWith2MetricsAndAttributeNoPrimaries = recordedDataFacade(
    ReferenceRecordings.Scenarios.BubbleChart.YAxisAndSizeMeasuresWithViewBy as unknown as ScenarioRecording,
);

export const bubbleChartWith1Metric = recordedDataFacade(
    ReferenceRecordings.Scenarios.BubbleChart.XAxisMeasure as unknown as ScenarioRecording,
);

export const bubbleChartWith3MetricsAndAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.BubbleChart
        .XAndYAxisAndSizeMeasuresWithViewBy as unknown as ScenarioRecording,
);
export const bubbleChartWith3MetricsAndAttributeNullsInData = legacyRecordedDataFacade(
    BubbleChartWith3MetricsAndAttributeNullsInData,
);

//
// Combo chart
//
export const comboWithTwoMeasuresAndViewByAttribute = legacyRecordedDataFacade(
    ComboChartWithTwoMeasuresViewByAttribute,
);

export const comboChartWithTwoMeasuresViewByAttributeNoBuckets = legacyRecordedDataFacade(
    ComboChartWithTwoMeasuresViewByAttributeNoBuckets,
);

export const comboChartWithTwoMeasuresViewByAttributePercformat = legacyRecordedDataFacade(
    ComboChartWithTwoMeasuresViewByAttributePercformat,
);

//
//
//
export const headlineWithOneMeasure = recordedDataFacade(
    ReferenceRecordings.Scenarios.Headline
        .MultiMeasuresWithOnlyPrimaryMeasure as unknown as ScenarioRecording,
);
export const headlineWithOneMeasureWithIdentifier = recordedDataFacade(
    ReferenceRecordings.Scenarios.Headline
        .MultiMeasuresWithOnlyPrimaryMeasure as unknown as ScenarioRecording,
);
export const headlineWithTwoMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.Headline.MultiMeasuresWithTwoMeasures as unknown as ScenarioRecording,
);
export const headlineWithTwoMeasuresWithIdentifier = recordedDataFacade(
    ReferenceRecordings.Scenarios.Headline.MultiMeasuresWithTwoMeasures as unknown as ScenarioRecording,
);
export const headlineWithTwoMeasuresFirstEmpty = legacyRecordedDataFacade(HeadlineWithTwoMeasuresFirstEmpty);
export const headlineWithTwoMeasuresSecondEmpty = legacyRecordedDataFacade(
    HeadlineWithTwoMeasuresSecondEmpty,
);
export const headlineWithTwoMeasuresBothEmpty = legacyRecordedDataFacade(HeadlineWithTwoMeasuresBothEmpty);
export const headlineWithTwoMeasuresBothZero = legacyRecordedDataFacade(HeadlineWithTwoMeasuresBothZero);
export const headlineWithTwoMeasuresFirstZero = legacyRecordedDataFacade(HeadlineWithTwoMeasuresFirstZero);
export const headlineWithTwoMeasuresSecondZero = legacyRecordedDataFacade(HeadlineWithTwoMeasuresSecondZero);
export const headlineWithTwoMeasuresBothSame = legacyRecordedDataFacade(HeadlineWithTwoMeasuresBothSame);

//
// Heatmap recordings
//

export const heatMapWithEmptyCells = recordedDataFacade(
    ReferenceRecordings.Scenarios.Heatmap.ThemedWithNullValues as unknown as ScenarioRecording,
);
export const heatMapWithMetricRowColumn = recordedDataFacade(
    ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
);
//
// Pie chart recordings
//

export const pieChartWithMetricsOnly = legacyRecordedDataFacade(PieChartWithMetricsOnly);
export const pieChartWithMetricsOnlyFundata = legacyRecordedDataFacade(PieChartWithMetricsOnlyFundata);

//
// Scatter plot recording
//

export const scatterPlotWith2MetricsAndAttributeNullsInData = legacyRecordedDataFacade(
    ScatterPlotWith2MetricsAndAttributeNullsInData,
);
export const scatterPlotWith2MetricsAndAttributeWithPrimary = recordedDataFacade(
    ReferenceRecordings.Scenarios.ScatterPlot.XAndYAxisMeasuresAndAttribute as unknown as ScenarioRecording,
);

//
// Treemap recordings
//

export const treemapWithMetricAndStackByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.Treemap.SingleMeasureAndSegment as unknown as ScenarioRecording,
);
export const treemapWithMetricAndViewByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.Treemap.SingleMeasureAndViewBy as unknown as ScenarioRecording,
);
export const treemapWithTwoMetricsAndStackByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.Treemap.TwoMeasuresAndSegmentBy as unknown as ScenarioRecording,
);
export const treemapWithMetricViewByAndStackByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.Treemap.SingleMeasureViewByAndSegment as unknown as ScenarioRecording,
);
