// (C) 2007-2022 GoodData Corporation
import { ColDef, ColGroupDef } from "@ag-grid-community/all-modules";
import findIndex from "lodash/findIndex";
import {
    COLUMN_ATTRIBUTE_COLUMN,
    COLUMN_GROUPING_DELIMITER,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
} from "../base/constants";
import {
    agColId,
    DataCol,
    ColumnGroupingDescriptorId,
    SliceCol,
    TableColDefs,
    TableCols,
    ScopeCol,
} from "./tableDescriptorTypes";
import { ISortItem, sortDirection } from "@gooddata/sdk-model";
import { attributeSortMatcher, measureSortMatcher } from "./colSortItemMatching";

type TransformState = {
    initialSorts: ISortItem[];
    cellRendererPlaced: ColDef | undefined;
    rowColDefs: Array<ColDef>;
    rootColDefs: Array<ColDef | ColGroupDef>;
    leafColDefs: Array<ColDef>;
    allColDefs: Array<ColDef | ColGroupDef>;
};

function getSortProp(
    initialSorts: ISortItem[],
    predicate: (sortItem: ISortItem) => boolean,
): Partial<ColDef> {
    const sortIndex = findIndex(initialSorts, (s) => predicate(s));
    const sort = initialSorts[sortIndex];

    return sort
        ? {
              sort: sortDirection(sort),
              // use sortedAt to make sure the order of sorts is the same as the order of columns
              sortedAt: sortIndex,
          }
        : {};
}

function createAndAddSliceColDefs(rows: SliceCol[], state: TransformState) {
    for (const row of rows) {
        const sortProp = getSortProp(state.initialSorts, (s) => attributeSortMatcher(row, s));
        const cellRendererProp = !state.cellRendererPlaced ? { cellRenderer: "loadingRenderer" } : {};

        const colDef: ColDef = {
            type: ROW_ATTRIBUTE_COLUMN,
            colId: row.id,
            field: row.id,
            headerName: row.attributeDescriptor.attributeHeader.formOf.name,
            ...cellRendererProp,
            ...sortProp,
        };

        state.rowColDefs.push(colDef);
        state.allColDefs.push(colDef);

        if (!state.cellRendererPlaced) {
            state.cellRendererPlaced = colDef;
        }
    }
}

function createColumnGroupColDef(col: ScopeCol, state: TransformState): ColDef | ColGroupDef {
    const children = createColumnHeadersFromDescriptors(col.children, state);

    if (children.length === 0) {
        const colDef: ColDef = {
            type: COLUMN_ATTRIBUTE_COLUMN,
            colId: col.id,
            headerName: col.header.attributeHeaderItem.name ?? "NULL", // TODO RAIL-4360 localize this when the null strings are available
        };

        state.allColDefs.push(colDef);
        state.leafColDefs.push(colDef);

        return colDef;
    } else {
        const colGroup: ColGroupDef = {
            groupId: col.id,
            headerName: col.header.attributeHeaderItem.name ?? "NULL", // TODO RAIL-4360 localize this when the null strings are available
            children,
        };

        state.allColDefs.push(colGroup);

        return colGroup;
    }
}

function createColumnHeadersFromDescriptors(
    cols: DataCol[],
    state: TransformState,
): Array<ColGroupDef | ColDef> {
    const colDefs: Array<ColGroupDef | ColDef> = [];

    for (const col of cols) {
        switch (col.type) {
            case "rootCol": {
                const colDef: ColGroupDef = {
                    groupId: ColumnGroupingDescriptorId,
                    children: createColumnHeadersFromDescriptors(col.children, state),
                    headerName: col.groupingAttributes
                        .map((attr) => attr.attributeHeader.formOf.name)
                        .join(COLUMN_GROUPING_DELIMITER),
                };

                colDefs.push(colDef);
                state.allColDefs.push(colDef);

                break;
            }
            case "scopeCol": {
                colDefs.push(createColumnGroupColDef(col, state));

                break;
            }
            case "seriesCol": {
                const sortProp = getSortProp(state.initialSorts, (s) => measureSortMatcher(col, s));
                const cellRendererProp = !state.cellRendererPlaced ? { cellRenderer: "loadingRenderer" } : {};

                const colDef: ColDef = {
                    type: MEASURE_COLUMN,
                    colId: col.id,
                    field: col.id,
                    headerName: col.seriesDescriptor.measureTitle(),
                    ...sortProp,
                    ...cellRendererProp,
                };

                colDefs.push(colDef);
                state.leafColDefs.push(colDef);
                state.allColDefs.push(colDef);

                if (!state.cellRendererPlaced) {
                    state.cellRendererPlaced = colDef;
                }

                break;
            }
        }
    }

    return colDefs;
}

function createAndAddDataColDefs(table: TableCols, state: TransformState) {
    const cols = createColumnHeadersFromDescriptors(table.rootDataCols, state);

    state.rootColDefs.push(...cols);
}

//
//
//

/**
 * Given table column descriptors & list of sort items, this function will create ag-grid ColDefs which mirror
 * the column descriptor. Any ColDefs whose descriptors match the sortItems will have the sorts set according
 * to the matching sort item.
 *
 * @param table - table col descriptors
 * @param initialSorts - initial table sorting definition
 */
export function createColDefsFromTableDescriptor(table: TableCols, initialSorts: ISortItem[]): TableColDefs {
    const state: TransformState = {
        initialSorts,
        cellRendererPlaced: undefined,
        rootColDefs: [],
        allColDefs: [],
        leafColDefs: [],
        rowColDefs: [],
    };

    createAndAddSliceColDefs(table.sliceCols, state);
    createAndAddDataColDefs(table, state);

    const idToColDef: Record<string, ColDef | ColGroupDef> = {};

    state.allColDefs.forEach((colDef) => (idToColDef[agColId(colDef)] = colDef));

    return {
        sliceColDefs: state.rowColDefs,
        rootDataColDefs: state.rootColDefs,
        leafDataColDefs: state.leafColDefs,
        idToColDef,
    };
}
