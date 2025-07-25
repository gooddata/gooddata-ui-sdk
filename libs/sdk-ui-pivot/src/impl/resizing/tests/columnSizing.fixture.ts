// (C) 2007-2025 GoodData Corporation
import { recordedDataFacade } from "../../../../__mocks__/recordings.js";
import { DataViewFirstPage, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { TableDescriptor } from "../../structure/tableDescriptor.js";
import { ColumnWidthItem } from "../../../columnWidths.js";
import { ResizedColumnsStore } from "../columnSizing.js";
import { Column, GridApi } from "ag-grid-community";

const ColumnOnlyResult = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleColumn as ScenarioRecording,
    DataViewFirstPage,
);

export const ColumnOnlyResultDescriptor = TableDescriptor.for(ColumnOnlyResult, "empty value");

export const TwoMeasuresWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithRowAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const TwoMeasuresWithRowAttributeDescriptor = TableDescriptor.for(
    TwoMeasuresWithRowAttribute,
    "empty value",
);

const SingleMeasureWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute as ScenarioRecording,
    DataViewFirstPage,
);

export const SingleMeasureWithRowAttributeDescriptor = TableDescriptor.for(
    SingleMeasureWithRowAttribute,
    "empty value",
);

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithTwoRowAndTwoColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);
export const TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor = TableDescriptor.for(
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    "empty value",
);

export function testStore(
    tableDescriptor: TableDescriptor,
    ...widths: ColumnWidthItem[]
): ResizedColumnsStore {
    const store = new ResizedColumnsStore(tableDescriptor);

    if (widths.length) {
        store.updateColumnWidths(widths);
    }

    return store;
}

export const getFakeColumnApi = (columnsMaps: { [id: string]: Column }): GridApi => {
    const fakeColumnApi = {
        getColumn: (columnId: string) => {
            return columnsMaps[columnId];
        },
        setColumnWidth: (column: Column, width: number) => {
            columnsMaps[column.getColId()].getColDef().width = width;
        },
        getAllGridColumns: () => {
            return Object.keys(columnsMaps).map((colId: string) => columnsMaps[colId]);
        },
    };
    return fakeColumnApi as any;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getFakeColumn = (colDef: any): Column => {
    const columnDefinition = {
        ...colDef,
    };
    const fakeColumn = {
        getColDef: () => {
            return columnDefinition;
        },
        getColId: () => {
            return columnDefinition.colId;
        },

        getActualWidth: () => {
            return columnDefinition.width;
        },
        drillItems: columnDefinition.drillItems,
    };

    return fakeColumn as unknown as Column;
};
