// (C) 2007-2026 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { AreaChartWith3MetricsAndViewByAttribute } from "./fixturesData/AreaChartWith3MetricsAndViewByAttribute.js";
import { BarChartWith3MetricsAndViewByAttribute } from "./fixturesData/BarChartWith3MetricsAndViewByAttribute.js";
import { BarChartWith3MetricsAndViewByAttributeFunformat } from "./fixturesData/BarChartWith3MetricsAndViewByAttributeFunformat.js";
import { BarChartWith3MetricsAndViewByAttributePercInFormat } from "./fixturesData/BarChartWith3MetricsAndViewByAttributePercInFormat.js";
import { BarChartWith4MetricsAndViewByTwoAttributes } from "./fixturesData/BarChartWith4MetricsAndViewByTwoAttributes.js";
import { BarChartWithPopMeasureAndViewByAttribute } from "./fixturesData/BarChartWithPopMeasureAndViewByAttribute.js";
import { BarChartWithPopMeasureAndViewByAttributeX6 } from "./fixturesData/BarChartWithPopMeasureAndViewByAttributeX6.js";
import { BarChartWithPreviousPeriodMeasure } from "./fixturesData/BarChartWithPreviousPeriodMeasure.js";
import { BarChartWithPreviousPeriodMeasureX6 } from "./fixturesData/BarChartWithPreviousPeriodMeasureX6.js";
import { BubbleChartWith3MetricsAndAttributeNullsInData } from "./fixturesData/BubbleChartWith3MetricsAndAttributeNullsInData.js";
import { ComboChartWithTwoMeasuresViewByAttribute } from "./fixturesData/ComboChartWithTwoMeasuresViewByAttribute.js";
import { ComboChartWithTwoMeasuresViewByAttributeNoBuckets } from "./fixturesData/ComboChartWithTwoMeasuresViewByAttributeNoBuckets.js";
import { ComboChartWithTwoMeasuresViewByAttributePercformat } from "./fixturesData/ComboChartWithTwoMeasuresViewByAttributePercformat.js";
import { HeadlineWithTwoMeasuresBothEmpty } from "./fixturesData/HeadlineWithTwoMeasuresBothEmpty.js";
import { HeadlineWithTwoMeasuresBothSame } from "./fixturesData/HeadlineWithTwoMeasuresBothSame.js";
import { HeadlineWithTwoMeasuresBothZero } from "./fixturesData/HeadlineWithTwoMeasuresBothZero.js";
import { HeadlineWithTwoMeasuresFirstEmpty } from "./fixturesData/HeadlineWithTwoMeasuresFirstEmpty.js";
import { HeadlineWithTwoMeasuresFirstZero } from "./fixturesData/HeadlineWithTwoMeasuresFirstZero.js";
import { HeadlineWithTwoMeasuresSecondEmpty } from "./fixturesData/HeadlineWithTwoMeasuresSecondEmpty.js";
import { HeadlineWithTwoMeasuresSecondZero } from "./fixturesData/HeadlineWithTwoMeasuresSecondZero.js";
import { PieChartWithMetricsOnly } from "./fixturesData/PieChartWithMetricsOnly.js";
import { PieChartWithMetricsOnlyFundata } from "./fixturesData/PieChartWithMetricsOnlyFundata.js";
import { ScatterPlotWith2MetricsAndAttributeNullsInData } from "./fixturesData/ScatterPlotWith2MetricsAndAttributeNullsInData.js";
import { type ILocalExecutionRecording, localDataView } from "./localDataView.js";
import { recordedDataFacade } from "./recordings.js";

function localFixtureDataFacade(recording: ILocalExecutionRecording): DataViewFacade {
    return DataViewFacade.for(localDataView(recording));
}

//
// new fixtures
//

export const testWorkspace = "testWorkspace";

//
// Area chart fixtures
//

export const areaChartWith3MetricsAndViewByAttribute = localFixtureDataFacade(
    AreaChartWith3MetricsAndViewByAttribute,
);

export const areaChartWithMeasureViewByAndStackBy = recordedDataFacade(
    ReferenceRecordings.Scenarios.AreaChart.SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
);

//
// Bar chart fixtures
//

export const barChartWith4MetricsAndViewByTwoAttributes = localFixtureDataFacade(
    BarChartWith4MetricsAndViewByTwoAttributes,
);
export const barChartWithStackByAndViewByAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
);
export const barChartWithViewByAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy as unknown as ScenarioRecording,
);

export const barChartWith3MetricsAndViewByAttribute = localFixtureDataFacade(
    BarChartWith3MetricsAndViewByAttribute,
);
export const barChartWith3MetricsAndViewByAttributeFunformat = localFixtureDataFacade(
    BarChartWith3MetricsAndViewByAttributeFunformat,
);

export const barChartWith3MetricsAndViewByAttributePercInFormat = localFixtureDataFacade(
    BarChartWith3MetricsAndViewByAttributePercInFormat,
);

export const barChartWithPopMeasureAndViewByAttribute = localFixtureDataFacade(
    BarChartWithPopMeasureAndViewByAttribute,
);

export const barChartWithPopMeasureAndViewByAttributeX6 = localFixtureDataFacade(
    BarChartWithPopMeasureAndViewByAttributeX6,
);

export const barChartWithPreviousPeriodMeasure = localFixtureDataFacade(BarChartWithPreviousPeriodMeasure);
export const barChartWithSingleMeasureAndNoAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.BarChart.SingleMeasure as unknown as ScenarioRecording,
);

export const barChartWithPreviousPeriodMeasureX6 = localFixtureDataFacade(
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
export const bubbleChartWith3MetricsAndAttributeNullsInData = localFixtureDataFacade(
    BubbleChartWith3MetricsAndAttributeNullsInData,
);

//
// Combo chart
//
export const comboWithTwoMeasuresAndViewByAttribute = localFixtureDataFacade(
    ComboChartWithTwoMeasuresViewByAttribute,
);

export const comboChartWithTwoMeasuresViewByAttributeNoBuckets = localFixtureDataFacade(
    ComboChartWithTwoMeasuresViewByAttributeNoBuckets,
);

export const comboChartWithTwoMeasuresViewByAttributePercformat = localFixtureDataFacade(
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
export const headlineWithTwoMeasuresFirstEmpty = localFixtureDataFacade(HeadlineWithTwoMeasuresFirstEmpty);
export const headlineWithTwoMeasuresSecondEmpty = localFixtureDataFacade(HeadlineWithTwoMeasuresSecondEmpty);
export const headlineWithTwoMeasuresBothEmpty = localFixtureDataFacade(HeadlineWithTwoMeasuresBothEmpty);
export const headlineWithTwoMeasuresBothZero = localFixtureDataFacade(HeadlineWithTwoMeasuresBothZero);
export const headlineWithTwoMeasuresFirstZero = localFixtureDataFacade(HeadlineWithTwoMeasuresFirstZero);
export const headlineWithTwoMeasuresSecondZero = localFixtureDataFacade(HeadlineWithTwoMeasuresSecondZero);
export const headlineWithTwoMeasuresBothSame = localFixtureDataFacade(HeadlineWithTwoMeasuresBothSame);

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

export const pieChartWithMetricsOnly = localFixtureDataFacade(PieChartWithMetricsOnly);
export const pieChartWithMetricsOnlyFundata = localFixtureDataFacade(PieChartWithMetricsOnlyFundata);

//
// Scatter plot recording
//

export const scatterPlotWith2MetricsAndAttributeNullsInData = localFixtureDataFacade(
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
