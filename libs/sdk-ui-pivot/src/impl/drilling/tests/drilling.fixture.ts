// (C) 2007-2022 GoodData Corporation
import { recordedDataFacade } from "../../../../__mocks__/recordings";
import { DataViewFirstPage } from "@gooddata/sdk-backend-mockingbird";
import { TableDescriptor } from "../../structure/tableDescriptor";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IGridRow } from "../../data/resultTypes";
import invariant from "ts-invariant";
import { IResultAttributeHeader } from "@gooddata/sdk-model";
import { fromPairs } from "lodash";

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    DataViewFirstPage,
);
export const TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor = TableDescriptor.for(
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    "empty value",
);
export const OneMeasureAndRepeatingRowAttributesOnDifferentPositions = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.OneMeasureAndRepeatingRowAttributesOnDifferentPositions,
    DataViewFirstPage,
);

export function createTestRow(
    tableDescriptor: TableDescriptor,
    rowHeaders: Array<{ uri: string; title: string }>,
): IGridRow {
    invariant(tableDescriptor.sliceColCount() === rowHeaders.length);

    const resultHeaders: [string, IResultAttributeHeader][] = rowHeaders.map((header, idx) => {
        return [
            `r_${idx}`,
            {
                attributeHeaderItem: {
                    name: header.title,
                    uri: header.uri,
                },
            },
        ];
    });

    const rowValues = fromPairs(rowHeaders.map((header, idx) => [`r_${idx}`, header.title]));
    const colValues = fromPairs(tableDescriptor.headers.leafDataCols.map((col, idx) => [col.id, `${idx}`]));

    const headerItemMap: Record<string, IResultAttributeHeader> = fromPairs(resultHeaders);

    return {
        headerItemMap,
        ...rowValues,
        ...colValues,
    };
}
