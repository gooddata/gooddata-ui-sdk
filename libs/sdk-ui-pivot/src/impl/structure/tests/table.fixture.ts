// (C) 2007-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../testUtils/recordings.js";

export const SingleMeasureWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasures as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasuresWithColumnAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleMeasureWithColumnAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithColumnAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleMeasureWithRowAndColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleMeasureWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .SingleMeasureWithTwoRowAndTwoColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleColumn = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleColumn as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasuresAndGrandTotalsAndMultipleSubtotals = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .TwoMeasuresAndGrandTotalsAndMultipleSubtotals as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasuresWithSingleRowAttrWithMetricsInRows = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .TwoMeasuresWithSingleRowAttrWithMetricsInRows as ScenarioRecording,
    DataViewFirstPage,
);

export const MultipleMeasuresAndNoColumnsWithMetricsInRows = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.MultipleMeasuresAndNoColumnsWithTotals as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresInRowsAndOnlyColumnAttrsOnLeft as ScenarioRecording,
    DataViewFirstPage,
);
