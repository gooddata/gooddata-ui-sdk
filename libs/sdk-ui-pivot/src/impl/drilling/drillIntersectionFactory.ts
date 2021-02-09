// (C) 2021 GoodData Corporation
import { getDrillIntersection, IDrillEventIntersectionElement, IMappingHeader } from "@gooddata/sdk-ui";
import { TableDescriptor } from "../structure/tableDescriptor";
import { AnyCol, isDataColLeaf, isSliceCol } from "../structure/tableDescriptorTypes";
import { CellEvent } from "@ag-grid-community/all-modules";
import invariant from "ts-invariant";
import { createDataColLeafHeaders, createSliceColHeaders } from "./colDrillHeadersFactory";
import { IGridRow } from "../data/resultTypes";

/**
 * Given an ag-grid cell event and table descriptor, create a drill intersection that exactly describes
 * coordinates of the clicked cell - by using attribute element headers, attribute descriptors and optionally measure
 * descriptor.
 *
 * @param cellEvent - cell event from ag-grid
 * @param tableDescriptor - table descriptor
 */
export function createDrillIntersection(
    cellEvent: CellEvent,
    tableDescriptor: TableDescriptor,
): IDrillEventIntersectionElement[] {
    const mappingHeaders: IMappingHeader[] = [];
    const col: AnyCol = tableDescriptor.getCol(cellEvent.colDef);
    const row = cellEvent.data as IGridRow;

    invariant(isSliceCol(col) || isDataColLeaf(col));

    if (isDataColLeaf(col)) {
        mappingHeaders.push(...createDataColLeafHeaders(col));
    }

    const effectiveSliceCols = tableDescriptor.getSliceColsUpToIncludingCol(col);

    effectiveSliceCols.forEach((col) => mappingHeaders.push(...createSliceColHeaders(col, row)));

    return getDrillIntersection(mappingHeaders);
}
