// (C) 2007-2025 GoodData Corporation
import { ColDef, ColGroupDef, SortDirection } from "ag-grid-community";
import findIndex from "lodash/findIndex.js";
import { IntlShape } from "react-intl";

import { ISortItem, isResultTotalHeader, sortDirection } from "@gooddata/sdk-model";
import { getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { attributeSortMatcher, measureSortMatcher } from "./colSortItemMatching.js";
import { ColumnTotalGroupHeader } from "./headers/ColumnTotalGroupHeader.js";
import {
    ColumnGroupingDescriptorId,
    DataCol,
    MixedHeadersCol,
    MixedValuesCol,
    ScopeCol,
    SliceCol,
    SliceMeasureCol,
    TableColDefs,
    TableCols,
    agColId,
} from "./tableDescriptorTypes.js";
import { messages } from "../../locales.js";
import { IPivotTableConfig } from "../../publicTypes.js";
import {
    COLUMN_ATTRIBUTE_COLUMN,
    COLUMN_GROUPING_DELIMITER,
    COLUMN_SUBTOTAL,
    COLUMN_TOTAL,
    MEASURE_COLUMN,
    MIXED_HEADERS_COLUMN,
    MIXED_VALUES_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
    ROW_MEASURE_COLUMN,
} from "../base/constants.js";

type TransformState = {
    initialSorts: ISortItem[];
    rowColDefs: Array<ColDef>;
    rootColDefs: Array<ColDef | ColGroupDef>;
    leafColDefs: Array<ColDef>;
    allColDefs: Array<ColDef | ColGroupDef>;
    emptyHeaderTitle: string;
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
              // use sortIndex to make sure the order of sorts is the same as the order of columns
              sortIndex,
          }
        : {};
}

const DESC_FIRST = ["desc", "asc"] as SortDirection[];
const ASC_FIRST = ["asc", "desc"] as SortDirection[];

function createAndAddSliceColDefs(rows: SliceCol[], measureCols: SliceMeasureCol[], state: TransformState) {
    for (const row of rows) {
        const sortProp = getSortProp(state.initialSorts, (s) => attributeSortMatcher(row, s));
        const headerName = row.attributeDescriptor.attributeHeader.formOf.name;

        const colDef: ColDef = {
            type: ROW_ATTRIBUTE_COLUMN,
            colId: row.id,
            field: row.id,
            headerName,
            headerTooltip: headerName,
            ...sortProp,
            sortingOrder: sortProp.sort === "desc" ? DESC_FIRST : ASC_FIRST,
        };

        state.rowColDefs.push(colDef);
        state.allColDefs.push(colDef);
    }

    for (const col of measureCols) {
        const colDef: ColDef = {
            type: ROW_MEASURE_COLUMN,
            colId: col.id,
            field: col.id,
            headerName: "",
            headerTooltip: undefined,
        };

        state.rowColDefs.push(colDef);
        state.allColDefs.push(colDef);
    }
}

function createAndAddMixedValuesColDefs(mixedValuesCol: MixedValuesCol[], state: TransformState) {
    for (const col of mixedValuesCol) {
        const colDef: ColDef = {
            type: MIXED_VALUES_COLUMN,
            colId: col.id,
            field: col.id,
            headerName: "", // do not render header, yet leave ability to resize it
            headerTooltip: undefined,
        };

        state.rowColDefs.push(colDef);
        state.allColDefs.push(colDef);
    }
}

function createAndAddMixedHeadersColDefs(
    mixedHeadersCol: MixedHeadersCol[],
    state: TransformState,
    isTransposed: boolean,
) {
    for (const col of mixedHeadersCol) {
        if (isTransposed) {
            const colDef: ColDef = {
                type: MIXED_HEADERS_COLUMN,
                colId: col.id,
                field: col.id,
                headerName: "",
                headerTooltip: undefined,
            };

            state.rowColDefs.push(colDef);
            state.allColDefs.push(colDef);
        } // else branch would be needed when column header position starts to be independent on measures in rows
    }
}

function getTotalHeaderName(col: ScopeCol, intl: IntlShape | undefined, headerName: string) {
    const isTotalSubGroup = col.headersToHere.some((header) => isResultTotalHeader(header));
    return isTotalSubGroup ? "" : intl?.formatMessage(messages[headerName]);
}

function createColumnGroupColDef(
    col: ScopeCol,
    state: TransformState,
    intl?: IntlShape,
): ColDef | ColGroupDef {
    const children = createColumnHeadersFromDescriptors(col.children, state, intl);
    const headerName = valueWithEmptyHandling(
        getMappingHeaderFormattedName(col.header),
        state.emptyHeaderTitle,
    );
    if (children.length === 0) {
        const mappedHeaderName = isResultTotalHeader(col.header)
            ? getTotalHeaderName(col, intl, headerName)
            : headerName;

        const colDef: ColDef = {
            type: COLUMN_ATTRIBUTE_COLUMN,
            colId: col.id,
            field: col.id, // this will allow scopeCol to display measure values in the column if measures are in rows
            headerName: mappedHeaderName,
            headerTooltip: mappedHeaderName,
        };

        state.allColDefs.push(colDef);
        state.leafColDefs.push(colDef);

        return colDef;
    } else {
        let colGroup: ColDef | ColGroupDef;

        if (isResultTotalHeader(col.header)) {
            const isTotal = col.isTotal;
            const isTotalSubGroup = col.headersToHere.some((header) => isResultTotalHeader(header));
            const totalHeaderName = isTotalSubGroup ? "" : intl!.formatMessage(messages[headerName]);
            colGroup = {
                type: isTotal ? COLUMN_TOTAL : COLUMN_SUBTOTAL,
                colId: col.id,
                headerName: totalHeaderName,
                headerTooltip: totalHeaderName,
                children,
                headerGroupComponent: ColumnTotalGroupHeader,
            };
        } else {
            colGroup = {
                groupId: col.id,
                headerName,
                headerTooltip: headerName,
                children,
            };
        }

        state.allColDefs.push(colGroup);

        return colGroup;
    }
}

function createColumnHeadersFromDescriptors(
    cols: DataCol[],
    state: TransformState,
    intl?: IntlShape,
): Array<ColGroupDef | ColDef> {
    const colDefs: Array<ColGroupDef | ColDef> = [];

    for (const col of cols) {
        switch (col.type) {
            case "rootCol": {
                const headerName = col.groupingAttributes
                    .map((attr) => attr.attributeHeader.formOf.name)
                    .join(COLUMN_GROUPING_DELIMITER);
                const colDef: ColGroupDef = {
                    groupId: ColumnGroupingDescriptorId,
                    children: createColumnHeadersFromDescriptors(col.children, state, intl),
                    headerName,
                    headerTooltip: headerName,
                };

                colDefs.push(colDef);
                state.allColDefs.push(colDef);

                break;
            }
            case "scopeCol": {
                colDefs.push(createColumnGroupColDef(col, state, intl));

                break;
            }
            case "seriesCol": {
                const sortProp = getSortProp(state.initialSorts, (s) => measureSortMatcher(col, s));
                const headerName = col.seriesDescriptor.measureTitle();
                const isTotal = col.seriesDescriptor.isTotal;
                const isSubtotal = col.seriesDescriptor.isSubtotal;
                const colDefType = isTotal ? COLUMN_TOTAL : isSubtotal ? COLUMN_SUBTOTAL : MEASURE_COLUMN;
                const colDef: ColDef = {
                    type: colDefType,
                    colId: col.id,
                    field: col.id,
                    headerName,
                    headerTooltip: headerName,
                    ...sortProp,
                    sortingOrder: sortProp.sort === "asc" ? ASC_FIRST : DESC_FIRST,
                };

                colDefs.push(colDef);
                state.leafColDefs.push(colDef);
                state.allColDefs.push(colDef);
                break;
            }
        }
    }

    return colDefs;
}

function createAndAddDataColDefs(table: TableCols, state: TransformState, intl?: IntlShape) {
    const cols = createColumnHeadersFromDescriptors(table.rootDataCols, state, intl);

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
 * @param emptyHeaderTitle - what to show for title of headers with empty title
 * @param config - optional pivot config
 */
export function createColDefsFromTableDescriptor(
    table: TableCols,
    initialSorts: ISortItem[],
    emptyHeaderTitle: string,
    isTransposed: boolean,
    config?: IPivotTableConfig,
    intl?: IntlShape,
): TableColDefs {
    const state: TransformState = {
        initialSorts,
        rootColDefs: [],
        allColDefs: [],
        leafColDefs: [],
        rowColDefs: [],
        emptyHeaderTitle,
    };

    createAndAddSliceColDefs(table.sliceCols, table.sliceMeasureCols, state);
    createAndAddDataColDefs(table, state, intl);
    if (config?.columnHeadersPosition === "left") {
        createAndAddMixedHeadersColDefs(table.mixedHeadersCols, state, isTransposed);
    }
    // outside of columnHeadersPosition === "left" condition to handle also metrics in rows and no column attribute case
    createAndAddMixedValuesColDefs(table.mixedValuesCols, state);

    const idToColDef: Record<string, ColDef | ColGroupDef> = {};

    state.allColDefs.forEach((colDef) => (idToColDef[agColId(colDef)] = colDef));

    return {
        sliceColDefs: state.rowColDefs,
        rootDataColDefs: state.rootColDefs,
        leafDataColDefs: state.leafColDefs,
        idToColDef,
    };
}
