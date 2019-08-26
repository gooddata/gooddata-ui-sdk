// (C) 2007-2019 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IDatasource, IGetRowsParams, GridApi } from "ag-grid-community";
import { getMappingHeaderName } from "../../../helpers/mappingHeader";

import InjectedIntl = ReactIntl.InjectedIntl;

import { getTreeLeaves, getSubtotalStyles } from "./agGridUtils";
import { COLUMN_GROUPING_DELIMITER, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import {
    getMeasureSortItemFieldAndDirection,
    getSortsFromModel,
    getAttributeSortItemFieldAndDirection,
    assignSorting,
} from "./agGridSorting";
import { IAgGridPage, IGridAdapterOptions, IGridHeader } from "./agGridTypes";

import { IGetPage } from "../base/VisualizationLoadingHOC";
import { IGroupingProvider } from "../pivotTable/GroupingProvider";
import {
    assortDimensionHeaders,
    getColumnHeaders,
    getFields,
    getMinimalRowData,
    getRowHeaders,
} from "./agGridHeaders";
import { getRow, getRowTotals } from "./agGridData";
import { areTotalsChanged, isInvalidGetRowsRequest, wrapGetPageWithCaching } from "./agGridDataSourceUtils";

export const getDataSourceRowsGetter = (
    resultSpec: AFM.IResultSpec,
    getPage: IGetPage,
    getExecution: () => Execution.IExecutionResponses,
    onSuccess: (
        execution: Execution.IExecutionResponses,
        columnDefs: IGridHeader[],
        resultSpec: AFM.IResultSpec,
    ) => void,
    getGridApi: () => GridApi,
    intl: InjectedIntl,
    columnTotals: AFM.ITotalItem[],
    getGroupingProvider: () => IGroupingProvider,
): ((params: IGetRowsParams) => void) => {
    return (getRowsParams: IGetRowsParams) => {
        const { startRow, endRow, successCallback, failCallback, sortModel } = getRowsParams;

        if (isInvalidGetRowsRequest(startRow, getGridApi())) {
            failCallback();
            return Promise.resolve(null);
        }

        const execution = getExecution();
        const groupingProvider = getGroupingProvider();

        let resultSpecUpdated: AFM.IResultSpec = resultSpec;
        // If execution is null, this means this is a fresh dataSource and we should ignore current sortModel
        if (sortModel.length > 0 && execution) {
            resultSpecUpdated = {
                ...resultSpecUpdated,
                sorts: getSortsFromModel(sortModel, execution),
            };
        }
        if (columnTotals && columnTotals.length > 0) {
            resultSpecUpdated = {
                ...resultSpecUpdated,
                dimensions: [
                    {
                        ...resultSpecUpdated.dimensions[0],
                        totals: columnTotals,
                    },
                    ...resultSpecUpdated.dimensions.slice(1),
                ],
            };
        }

        const pagePromise = getPage(
            resultSpecUpdated,
            // column limit defaults to SERVERSIDE_COLUMN_LIMIT (1000), because 1000 columns is hopefully enough.
            [endRow - startRow, undefined],
            // column offset defaults to 0, because we do not support horizontal paging yet
            [startRow, undefined],
        );
        return pagePromise.then((execution: Execution.IExecutionResponses | null) => {
            if (!execution) {
                return null;
            }

            const { columnDefs, rowData, rowTotals } = executionToAGGridAdapter(
                execution,
                resultSpecUpdated,
                intl,
                {
                    addLoadingRenderer: "loadingRenderer",
                },
            );
            const { offset, count, total } = execution.executionResult.paging;

            const rowAttributeIds = columnDefs
                .filter(columnDef => columnDef.type === ROW_ATTRIBUTE_COLUMN)
                .map(columnDef => columnDef.field);
            groupingProvider.processPage(rowData, offset[0], rowAttributeIds);
            // RAIL-1130: Backend returns incorrectly total: [1, N], when count: [0, N] and offset: [0, N]
            const lastRow = offset[0] === 0 && count[0] === 0 ? 0 : total[0];
            onSuccess(execution, columnDefs, resultSpecUpdated);
            successCallback(rowData, lastRow);

            // set totals
            if (areTotalsChanged(getGridApi(), rowTotals)) {
                getGridApi().setPinnedBottomRowData(rowTotals);
            }

            return execution;
        });
    };
};

export const executionToAGGridAdapter = (
    executionResponses: Execution.IExecutionResponses,
    resultSpec: AFM.IResultSpec = {},
    intl: InjectedIntl,
    options: IGridAdapterOptions = {},
): IAgGridPage => {
    const { makeRowGroups = false, addLoadingRenderer = null, columnDefOptions } = options;

    const {
        executionResponse: { dimensions },
        executionResult: { data, headerItems, totals },
    } = executionResponses;

    const columnAttributeHeaderCount = dimensions[1].headers.filter(
        (header: Execution.IHeader) => !!(header as Execution.IAttributeHeader).attributeHeader,
    ).length;

    const columnHeaders: IGridHeader[] = getColumnHeaders(
        headerItems[1],
        dimensions[1].headers,
        columnDefOptions,
    );
    const groupColumnHeaders: IGridHeader[] =
        columnAttributeHeaderCount > 0
            ? [
                  {
                      headerName: dimensions[1].headers
                          .filter(header => Execution.isAttributeHeader(header))
                          .map((header: Execution.IAttributeHeader) => {
                              return getMappingHeaderName(header);
                          })
                          .filter((item: string) => item !== null)
                          .join(COLUMN_GROUPING_DELIMITER),
                      field: "columnGroupLabel",
                      children: columnHeaders,
                      drillItems: [],
                  },
              ]
            : columnHeaders;

    const rowHeaders: IGridHeader[] =
        // There are supposed to be only attribute headers on the first dimension
        getRowHeaders(dimensions[0].headers as Execution.IAttributeHeader[], columnDefOptions, makeRowGroups);

    // build sortingMap from resultSpec.sorts
    const sorting = resultSpec.sorts || [];
    const sortingMap = {};
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
    sorting.forEach(sortItem => {
        if (AFM.isAttributeSortItem(sortItem)) {
            const [field, direction] = getAttributeSortItemFieldAndDirection(sortItem, attributeHeaders);
            sortingMap[field] = direction;
        }
        if (AFM.isMeasureSortItem(sortItem)) {
            const [field, direction] = getMeasureSortItemFieldAndDirection(sortItem, measureHeaderItems);
            sortingMap[field] = direction;
        }
    });
    // assign sorting and indexes
    const columnDefs: IGridHeader[] = [...rowHeaders, ...groupColumnHeaders].map((column, index) => {
        if (column.children) {
            getTreeLeaves(column).forEach((leafColumn, leafColumnIndex) => {
                leafColumn.index = index + leafColumnIndex;
                assignSorting(leafColumn, sortingMap);
            });
        }
        column.index = index;
        assignSorting(column, sortingMap);
        return column;
    });

    // Add loading indicator to the first column
    if (addLoadingRenderer) {
        const leafColumnDefs = getTreeLeaves(columnDefs);
        if (leafColumnDefs[0]) {
            leafColumnDefs[0].cellRenderer = addLoadingRenderer;
        }
    }

    const columnFields: string[] = getFields(headerItems[1]);
    const rowFields: string[] = rowHeaders.map(header => header.field);
    // PivotTable execution should always return a two-dimensional array (Execution.DataValue[][])
    const minimalRowData: Execution.DataValue[][] = getMinimalRowData(
        data as Execution.DataValue[][],
        headerItems[0],
    );

    const subtotalStyles = getSubtotalStyles(resultSpec.dimensions ? resultSpec.dimensions[0] : null);
    const rowData = minimalRowData.map((dataRow: Execution.DataValue[], dataRowIndex: number) =>
        getRow(dataRow, dataRowIndex, columnFields, rowHeaders, headerItems[0], subtotalStyles, intl),
    );

    const columnKeys = [...rowFields, ...columnFields];
    const rowTotals = getRowTotals(
        totals,
        columnKeys,
        dimensions[0].headers,
        resultSpec,
        measureHeaderItems.map(mhi => mhi.measureHeaderItem.localIdentifier),
        intl,
    );

    return {
        columnDefs,
        rowData,
        rowTotals,
    };
};

class GdToAgGridAdapter implements IDatasource {
    // not needed; see IDatasource
    public rowCount?: number;
    private destroyed: boolean = false;
    private onDestroy: () => void;
    private getRowsImpl: (params: IGetRowsParams) => void;

    public constructor(
        resultSpec: AFM.IResultSpec,
        getPage: IGetPage,
        getExecution: () => Execution.IExecutionResponses,
        onSuccess: (
            execution: Execution.IExecutionResponses,
            columnDefs: IGridHeader[],
            resultSpec: AFM.IResultSpec,
        ) => void,
        getGridApi: () => any,
        intl: InjectedIntl,
        columnTotals: AFM.ITotalItem[],
        getGroupingProvider: () => IGroupingProvider,
        cancelPagePromises: () => void,
    ) {
        this.onDestroy = cancelPagePromises;
        this.getRowsImpl = getDataSourceRowsGetter(
            resultSpec,
            wrapGetPageWithCaching(getPage),
            getExecution,
            onSuccess,
            getGridApi,
            intl,
            columnTotals,
            getGroupingProvider,
        );
    }

    public getRows(params: IGetRowsParams): void {
        if (this.destroyed) {
            return;
        }

        // NOTE: some of our tests rely on getRows() to return the actual promise
        return this.getRowsImpl(params);
    }

    public destroy(): void {
        this.destroyed = true;
        this.onDestroy();
    }
}

/**
 * Factory function to create ag-grid data source backed by GoodData executeAFM.
 *
 * @param resultSpec
 * @param getPage
 * @param getExecution
 * @param onSuccess
 * @param getGridApi
 * @param intl
 * @param columnTotals
 * @param getGroupingProvider
 * @param cancelPagePromises
 */
export const createAgGridDataSource = (
    resultSpec: AFM.IResultSpec,
    getPage: IGetPage,
    getExecution: () => Execution.IExecutionResponses,
    onSuccess: (
        execution: Execution.IExecutionResponses,
        columnDefs: IGridHeader[],
        resultSpec: AFM.IResultSpec,
    ) => void,
    getGridApi: () => any,
    intl: InjectedIntl,
    columnTotals: AFM.ITotalItem[],
    getGroupingProvider: () => IGroupingProvider,
    cancelPagePromises: () => void,
): IDatasource => {
    return new GdToAgGridAdapter(
        resultSpec,
        getPage,
        getExecution,
        onSuccess,
        getGridApi,
        intl,
        columnTotals,
        getGroupingProvider,
        cancelPagePromises,
    );
};
