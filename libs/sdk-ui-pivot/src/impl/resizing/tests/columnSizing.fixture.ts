// (C) 2007-2021 GoodData Corporation
import { recordedDataFacade } from "../../../../__mocks__/recordings";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { TableDescriptor } from "../../structure/tableDescriptor";
import { ColumnWidthItem } from "../../../columnWidths";
import { ResizedColumnsStore } from "../agGridColumnSizing";

const ColumnOnlyResult = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleColumn,
    DataViewFirstPage,
);

export const ColumnOnlyResultDescriptor = TableDescriptor.for(ColumnOnlyResult);

export const TwoMeasuresWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithRowAttribute,
    DataViewFirstPage,
);

export const TwoMeasuresWithRowAttributeDescriptor = TableDescriptor.for(TwoMeasuresWithRowAttribute);

const SingleMeasureWithRowAttribute = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.SingleMeasureWithRowAttribute,
    DataViewFirstPage,
);

export const SingleMeasureWithRowAttributeDescriptor = TableDescriptor.for(SingleMeasureWithRowAttribute);

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    DataViewFirstPage,
);
export const TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor = TableDescriptor.for(
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
);

export function testStore(
    tableDescriptor: TableDescriptor,
    ...widths: ColumnWidthItem[]
): ResizedColumnsStore {
    const store = new ResizedColumnsStore();

    if (widths.length) {
        store.updateColumnWidths(tableDescriptor, widths);
    }

    return store;
}
