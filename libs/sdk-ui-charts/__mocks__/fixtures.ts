// (C) 2007-2019 GoodData Corporation
import { LegacyExecutionRecording, legacyRecordedDataView } from "@gooddata/sdk-backend-mockingbird";

import * as rec from "./recordings/playlist.js";
import { DataViewFacade } from "@gooddata/sdk-ui";

function legacyRecordedDataFacade(rec: LegacyExecutionRecording): DataViewFacade {
    return DataViewFacade.for(legacyRecordedDataView(rec));
}

//
// new fixtures
//

export const testWorkspace = "testWorkspace";

//
// Area chart fixtures
//

export const areaChartWith3MetricsAndViewByAttribute = legacyRecordedDataFacade(
    rec.AreaChartWith3MetricsAndViewByAttribute,
);

export const areaChartWithMeasureViewByAndStackBy = legacyRecordedDataFacade(
    rec.AreaChartWithMeasureViewByAndStackBy,
);

//
// Bar chart fixtures
//

export const barChartWith4MetricsAndViewByTwoAttributes = legacyRecordedDataFacade(
    rec.BarChartWith4MetricsAndViewByTwoAttributes,
);
export const barChartWithStackByAndViewByAttributes = legacyRecordedDataFacade(
    rec.BarChartWithStackByAndViewByAttributes,
);
export const barChartWithViewByAttribute = legacyRecordedDataFacade(rec.BarChartWithViewByAttribute);

export const barChartWith3MetricsAndViewByAttribute = legacyRecordedDataFacade(
    rec.BarChartWith3MetricsAndViewByAttribute,
);
export const barChartWith3MetricsAndViewByAttributeFunformat = legacyRecordedDataFacade(
    rec.BarChartWith3MetricsAndViewByAttributeFunformat,
);

export const barChartWith3MetricsAndViewByAttributePercInFormat = legacyRecordedDataFacade(
    rec.BarChartWith3MetricsAndViewByAttributePercInFormat,
);

export const barChartWithPopMeasureAndViewByAttribute = legacyRecordedDataFacade(
    rec.BarChartWithPopMeasureAndViewByAttribute,
);

export const barChartWithPopMeasureAndViewByAttributeX6 = legacyRecordedDataFacade(
    rec.BarChartWithPopMeasureAndViewByAttributeX6,
);

export const barChartWithPreviousPeriodMeasure = legacyRecordedDataFacade(
    rec.BarChartWithPreviousPeriodMeasure,
);
export const barChartWithSingleMeasureAndNoAttributes = legacyRecordedDataFacade(
    rec.BarChartWithSingleMeasureAndNoAttributes,
);

export const barChartWithPreviousPeriodMeasureX6 = legacyRecordedDataFacade(
    rec.BarChartWithPreviousPeriodMeasureX6,
);

//
// Bubble chart
//
export const bubbleChartWith2MetricsAndAttributeNoPrimaries = legacyRecordedDataFacade(
    rec.BubbleChartWith2MetricsAndAttributeNoPrimaries,
);

export const bubbleChartWith1Metric = legacyRecordedDataFacade(rec.BubbleChartWith1Metric);

export const bubbleChartWith3MetricsAndAttribute = legacyRecordedDataFacade(
    rec.BubbleChartWith3MetricsAndAttribute,
);
export const bubbleChartWith3MetricsAndAttributeNullsInData = legacyRecordedDataFacade(
    rec.BubbleChartWith3MetricsAndAttributeNullsInData,
);

//
// Combo chart
//
export const comboWithTwoMeasuresAndViewByAttribute = legacyRecordedDataFacade(
    rec.ComboChartWithTwoMeasuresViewByAttribute,
);

export const comboChartWithTwoMeasuresViewByAttributeNoBuckets = legacyRecordedDataFacade(
    rec.ComboChartWithTwoMeasuresViewByAttributeNoBuckets,
);

export const comboChartWithTwoMeasuresViewByAttributePercformat = legacyRecordedDataFacade(
    rec.ComboChartWithTwoMeasuresViewByAttributePercformat,
);

//
//
//
export const headlineWithOneMeasure = legacyRecordedDataFacade(rec.HeadlineWithOneMeasure);
export const headlineWithOneMeasureWithIdentifier = legacyRecordedDataFacade(
    rec.HeadlineWithOneMeasureWithIdentifier,
);
export const headlineWithTwoMeasures = legacyRecordedDataFacade(rec.HeadlineWithTwoMeasures);
export const headlineWithTwoMeasuresWithIdentifier = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresWithIdentifier,
);
export const headlineWithTwoMeasuresFirstEmpty = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresFirstEmpty,
);
export const headlineWithTwoMeasuresSecondEmpty = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresSecondEmpty,
);
export const headlineWithTwoMeasuresBothEmpty = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresBothEmpty,
);
export const headlineWithTwoMeasuresBothZero = legacyRecordedDataFacade(rec.HeadlineWithTwoMeasuresBothZero);
export const headlineWithTwoMeasuresFirstZero = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresFirstZero,
);
export const headlineWithTwoMeasuresSecondZero = legacyRecordedDataFacade(
    rec.HeadlineWithTwoMeasuresSecondZero,
);
export const headlineWithTwoMeasuresBothSame = legacyRecordedDataFacade(rec.HeadlineWithTwoMeasuresBothSame);

//
// Heatmap recordings
//

export const heatMapWithEmptyCells = legacyRecordedDataFacade(rec.HeatMapWithEmptyCells);
export const heatMapWithMetricRowColumn = legacyRecordedDataFacade(rec.HeatMapWithMetricRowColumn);
//
// Pie chart recordings
//

export const pieChartWithMetricsOnly = legacyRecordedDataFacade(rec.PieChartWithMetricsOnly);
export const pieChartWithMetricsOnlyFundata = legacyRecordedDataFacade(rec.PieChartWithMetricsOnlyFundata);

//
// Scatter plot recording
//

export const scatterPlotWith2MetricsAndAttributeNullsInData = legacyRecordedDataFacade(
    rec.ScatterPlotWith2MetricsAndAttributeNullsInData,
);
export const scatterPlotWith2MetricsAndAttributeWithPrimary = legacyRecordedDataFacade(
    rec.ScatterPlotWith2MetricsAndAttributeWithPrimary,
);

//
// Treemap recordings
//

export const treemapWithMetricAndStackByAttribute = legacyRecordedDataFacade(
    rec.TreemapWithMetricAndStackByAttribute,
);
export const treemapWithMetricAndViewByAttribute = legacyRecordedDataFacade(
    rec.TreemapWithMetricAndViewByAttribute,
);
export const treemapWithTwoMetricsAndStackByAttribute = legacyRecordedDataFacade(
    rec.TreemapWithTwoMetricsAndStackByAttribute,
);
export const treemapWithMetricViewByAndStackByAttribute = legacyRecordedDataFacade(
    rec.TreemapWithMetricViewByAndStackByAttribute,
);
