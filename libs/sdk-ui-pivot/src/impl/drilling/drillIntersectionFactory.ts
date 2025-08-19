// (C) 2021-2025 GoodData Corporation
import { AgEventType, CellEvent } from "ag-grid-community";
import { invariant } from "ts-invariant";

import { IDrillEventIntersectionElement, IMappingHeader, getDrillIntersection } from "@gooddata/sdk-ui";

import {
    createDataColLeafHeaders,
    createMixedValuesColHeaders,
    createScopeColWithMetricHeaders,
    createSliceColHeaders,
} from "./colDrillHeadersFactory.js";
import { IGridRow } from "../data/resultTypes.js";
import { TableDescriptor } from "../structure/tableDescriptor.js";
import {
    AnyCol,
    isMixedValuesCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
} from "../structure/tableDescriptorTypes.js";

/**
 * Given an ag-grid cell event and table descriptor, create a drill intersection that exactly describes
 * coordinates of the clicked cell - by using attribute element headers, attribute descriptors and optionally measure
 * descriptor.
 *
 * @param cellEvent - cell event from ag-grid
 * @param tableDescriptor - table descriptor
 */
export function createDrillIntersection(
    cellEvent: CellEvent<AgEventType>,
    tableDescriptor: TableDescriptor,
    rowNodes: IGridRow[],
): IDrillEventIntersectionElement[] {
    const mappingHeaders: IMappingHeader[] = [];
    const col: AnyCol = tableDescriptor.getCol(cellEvent.colDef);
    const row = cellEvent.data as IGridRow;

    invariant(
        isSliceCol(col) ||
            isSeriesCol(col) ||
            (tableDescriptor.isTransposed() && isScopeCol(col)) ||
            (tableDescriptor.isTransposed() && isMixedValuesCol(col)),
    );

    if (isSeriesCol(col)) {
        mappingHeaders.push(...createDataColLeafHeaders(col));
    }

    if (tableDescriptor.isTransposed()) {
        if (isScopeCol(col)) {
            mappingHeaders.push(...createScopeColWithMetricHeaders(col, true, row));
        } else if (isMixedValuesCol(col)) {
            mappingHeaders.push(...createMixedValuesColHeaders(col, row));

            if (row.measureDescriptor) {
                rowNodes.forEach((rowNode) =>
                    mappingHeaders.push(...createMixedValuesColHeaders(col, rowNode)),
                );
            } else {
                rowNodes.forEach((rowNode) =>
                    mappingHeaders.unshift(...createMixedValuesColHeaders(col, rowNode)),
                );
            }
        }
    }

    const effectiveSliceCols = tableDescriptor.getSliceColsUpToIncludingCol(col);

    effectiveSliceCols.forEach((col) => mappingHeaders.push(...createSliceColHeaders(col, row)));

    return getDrillIntersection(mappingHeaders);
}
