// (C) 2007-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type IResultAttributeHeader } from "@gooddata/sdk-model";

import { recordedDataFacade } from "../../../../testUtils/recordings.js";
import { type IGridRow } from "../../data/resultTypes.js";
import { TableDescriptor } from "../../structure/tableDescriptor.js";

export const TwoMeasuresWithTwoRowAndTwoColumnAttributes = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithTwoRowAndTwoColumnAttributes as ScenarioRecording,
    DataViewFirstPage,
);
export const TwoMeasuresWithTwoRowAndTwoColumnAttributesDescriptor = TableDescriptor.for(
    TwoMeasuresWithTwoRowAndTwoColumnAttributes,
    "empty value",
);
export const OneMeasureAndRepeatingRowAttributesOnDifferentPositions = recordedDataFacade(
    ReferenceRecordings.Scenarios.PivotTable
        .OneMeasureAndRepeatingRowAttributesOnDifferentPositions as ScenarioRecording,
    DataViewFirstPage,
);

export function createTestRow(
    tableDescriptor: TableDescriptor,
    rowHeaders: Array<{ uri: string; title: string; formattedName?: string }>,
): IGridRow {
    invariant(tableDescriptor.sliceColCount() === rowHeaders.length);

    const resultHeaders: [string, IResultAttributeHeader][] = rowHeaders.map((header, idx) => {
        const formattedNameObj = header.formattedName ? { formattedName: header.formattedName } : {};
        return [
            `r_${idx}`,
            {
                attributeHeaderItem: {
                    name: header.title,
                    uri: header.uri,
                    ...formattedNameObj,
                },
            },
        ];
    });

    const rowValues = Object.fromEntries(rowHeaders.map((header, idx) => [`r_${idx}`, header.title]));
    const colValues = Object.fromEntries(
        tableDescriptor.headers.leafDataCols.map((col, idx) => [col.id, `${idx}`]),
    );

    const headerItemMap: Record<string, IResultAttributeHeader> = Object.fromEntries(resultHeaders);

    return {
        headerItemMap,
        ...rowValues,
        ...colValues,
    };
}
