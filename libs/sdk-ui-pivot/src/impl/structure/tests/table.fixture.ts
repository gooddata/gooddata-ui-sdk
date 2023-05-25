// (C) 2007-2021 GoodData Corporation
import { recordedDataFacade } from "../../../../__mocks__/recordings.js";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

export const SingleMeasureWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute,
    DataViewFirstPage,
);

export const TwoMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasures,
    DataViewFirstPage,
);

export const TwoMeasuresWithColumnAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute,
    DataViewFirstPage,
);

export const SingleMeasureWithColumnAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithColumnAttribute,
    DataViewFirstPage,
);

export const SingleMeasureWithRowAndColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAndColumnAttributes,
    DataViewFirstPage,
);

export const SingleMeasureWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithTwoRowAndTwoColumnAttributes,
    DataViewFirstPage,
);

export const SingleColumn = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleColumn,
    DataViewFirstPage,
);

export const SingleAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleAttribute,
    DataViewFirstPage,
);

export const TwoMeasuresAndGrandTotalsAndMultipleSubtotals = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndGrandTotalsAndMultipleSubtotals,
    DataViewFirstPage,
);
