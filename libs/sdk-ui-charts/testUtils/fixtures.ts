// (C) 2007-2026 GoodData Corporation

import { type LegacyExecutionRecording, legacyRecordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-ui";

import {
    AreaChartWith3MetricsAndViewByAttribute,
    AreaChartWithMeasureViewByAndStackBy,
    BarChartWith3MetricsAndViewByAttribute,
    BarChartWith3MetricsAndViewByAttributeFunformat,
    BarChartWith3MetricsAndViewByAttributePercInFormat,
    BarChartWith4MetricsAndViewByTwoAttributes,
    BarChartWithPopMeasureAndViewByAttribute,
    BarChartWithPopMeasureAndViewByAttributeX6,
    BarChartWithPreviousPeriodMeasure,
    BarChartWithPreviousPeriodMeasureX6,
    BarChartWithSingleMeasureAndNoAttributes,
    BarChartWithStackByAndViewByAttributes,
    BarChartWithViewByAttribute,
    BubbleChartWith1Metric,
    BubbleChartWith2MetricsAndAttributeNoPrimaries,
    BubbleChartWith3MetricsAndAttribute,
    BubbleChartWith3MetricsAndAttributeNullsInData,
    ComboChartWithTwoMeasuresViewByAttribute,
    ComboChartWithTwoMeasuresViewByAttributeNoBuckets,
    ComboChartWithTwoMeasuresViewByAttributePercformat,
    HeadlineWithOneMeasure,
    HeadlineWithOneMeasureWithIdentifier,
    HeadlineWithTwoMeasures,
    HeadlineWithTwoMeasuresBothEmpty,
    HeadlineWithTwoMeasuresBothSame,
    HeadlineWithTwoMeasuresBothZero,
    HeadlineWithTwoMeasuresFirstEmpty,
    HeadlineWithTwoMeasuresFirstZero,
    HeadlineWithTwoMeasuresSecondEmpty,
    HeadlineWithTwoMeasuresSecondZero,
    HeadlineWithTwoMeasuresWithIdentifier,
    HeatMapWithEmptyCells,
    HeatMapWithMetricRowColumn,
    PieChartWithMetricsOnly,
    PieChartWithMetricsOnlyFundata,
    ScatterPlotWith2MetricsAndAttributeNullsInData,
    ScatterPlotWith2MetricsAndAttributeWithPrimary,
    TreemapWithMetricAndStackByAttribute,
    TreemapWithMetricAndViewByAttribute,
    TreemapWithMetricViewByAndStackByAttribute,
    TreemapWithTwoMetricsAndStackByAttribute,
} from "./recordings/playlist.js";

function legacyRecordedDataFacade(recording: LegacyExecutionRecording): DataViewFacade {
    return DataViewFacade.for(legacyRecordedDataView(recording));
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

export const areaChartWithMeasureViewByAndStackBy = legacyRecordedDataFacade(
    AreaChartWithMeasureViewByAndStackBy,
);

//
// Bar chart fixtures
//

export const barChartWith4MetricsAndViewByTwoAttributes = legacyRecordedDataFacade(
    BarChartWith4MetricsAndViewByTwoAttributes,
);
export const barChartWithStackByAndViewByAttributes = legacyRecordedDataFacade(
    BarChartWithStackByAndViewByAttributes,
);
export const barChartWithViewByAttribute = legacyRecordedDataFacade(BarChartWithViewByAttribute);

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
export const barChartWithSingleMeasureAndNoAttributes = legacyRecordedDataFacade(
    BarChartWithSingleMeasureAndNoAttributes,
);

export const barChartWithPreviousPeriodMeasureX6 = legacyRecordedDataFacade(
    BarChartWithPreviousPeriodMeasureX6,
);

//
// Bubble chart
//
export const bubbleChartWith2MetricsAndAttributeNoPrimaries = legacyRecordedDataFacade(
    BubbleChartWith2MetricsAndAttributeNoPrimaries,
);

export const bubbleChartWith1Metric = legacyRecordedDataFacade(BubbleChartWith1Metric);

export const bubbleChartWith3MetricsAndAttribute = legacyRecordedDataFacade(
    BubbleChartWith3MetricsAndAttribute,
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
export const headlineWithOneMeasure = legacyRecordedDataFacade(HeadlineWithOneMeasure);
export const headlineWithOneMeasureWithIdentifier = legacyRecordedDataFacade(
    HeadlineWithOneMeasureWithIdentifier,
);
export const headlineWithTwoMeasures = legacyRecordedDataFacade(HeadlineWithTwoMeasures);
export const headlineWithTwoMeasuresWithIdentifier = legacyRecordedDataFacade(
    HeadlineWithTwoMeasuresWithIdentifier,
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

export const heatMapWithEmptyCells = legacyRecordedDataFacade(HeatMapWithEmptyCells);
export const heatMapWithMetricRowColumn = legacyRecordedDataFacade(HeatMapWithMetricRowColumn);
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
export const scatterPlotWith2MetricsAndAttributeWithPrimary = legacyRecordedDataFacade(
    ScatterPlotWith2MetricsAndAttributeWithPrimary,
);

//
// Treemap recordings
//

export const treemapWithMetricAndStackByAttribute = legacyRecordedDataFacade(
    TreemapWithMetricAndStackByAttribute,
);
export const treemapWithMetricAndViewByAttribute = legacyRecordedDataFacade(
    TreemapWithMetricAndViewByAttribute,
);
export const treemapWithTwoMetricsAndStackByAttribute = legacyRecordedDataFacade(
    TreemapWithTwoMetricsAndStackByAttribute,
);
export const treemapWithMetricViewByAndStackByAttribute = legacyRecordedDataFacade(
    TreemapWithMetricViewByAndStackByAttribute,
);
