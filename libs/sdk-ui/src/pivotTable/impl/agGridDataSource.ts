// (C) 2007-2019 GoodData Corporation
import {
    DataValue,
    DataViewFacade,
    IAttributeHeader,
    IDataView,
    IExecutionResult,
    IHeader,
    isAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import { GridApi, IDatasource, IGetRowsParams } from "ag-grid-community";
import { getMappingHeaderName } from "../../base/helpers/mappingHeader";

import { getSubtotalStyles, getTreeLeaves } from "./agGridUtils";
import { COLUMN_GROUPING_DELIMITER, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import {
    assignSorting,
    getAttributeSortItemFieldAndDirection,
    getMeasureSortItemFieldAndDirection,
} from "./agGridSorting";
import {
    DatasourceCallbacks,
    IAgGridPage,
    IGridAdapterOptions,
    IGridHeader,
    TableHeaders,
} from "./agGridTypes";
import { IGroupingProvider } from "./GroupingProvider";
import {
    assortDimensionHeaders,
    getColumnHeaders,
    getFields,
    getMinimalRowData,
    getRowHeaders,
} from "./agGridHeaders";
import { getRow, getRowTotals } from "./agGridData";
import { areTotalsChanged, isInvalidGetRowsRequest } from "./agGridDataSourceUtils";
import { isAttributeSort, isMeasureSort } from "@gooddata/sdk-model";
import InjectedIntl = ReactIntl.InjectedIntl;

export function createTableHeaders(dataView: IDataView, options: IGridAdapterOptions = {}): TableHeaders {
    const dv = new DataViewFacade(dataView);
    const dimensions = dv.dimensions();
    const headerItems = dv.headerItems();
    const { columnDefOptions, makeRowGroups = false } = options;

    const sorting = dv.definition.sortBy;
    const sortingMap = {};
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
    sorting.forEach(sortItem => {
        if (isAttributeSort(sortItem)) {
            const [field, direction] = getAttributeSortItemFieldAndDirection(sortItem, attributeHeaders);
            sortingMap[field] = direction;
        }
        if (isMeasureSort(sortItem)) {
            const [field, direction] = getMeasureSortItemFieldAndDirection(sortItem, measureHeaderItems);
            sortingMap[field] = direction;
        }
    });

    const columnAttributeHeaderCount = dimensions[1].headers.filter(
        (header: IHeader) => !!(header as IAttributeHeader).attributeHeader,
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
                          .filter(header => isAttributeHeader(header))
                          .map((header: IAttributeHeader) => {
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
        getRowHeaders(dimensions[0].headers as IAttributeHeader[], columnDefOptions, makeRowGroups);

    const allHeaders: IGridHeader[] = [...rowHeaders, ...groupColumnHeaders].map((column, index) => {
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

    const colFields: string[] = getFields(headerItems[1]);
    const rowFields: string[] = rowHeaders.map(header => header.field);

    const leafColumnDefs = getTreeLeaves(allHeaders);
    if (leafColumnDefs[0]) {
        leafColumnDefs[0].cellRenderer = "loadingRenderer";
    }

    return {
        rowHeaders,
        colHeaders: groupColumnHeaders,
        allHeaders,
        rowFields,
        colFields,
    };
}

export function createRowData(
    headers: TableHeaders,
    dv: DataViewFacade,
    intl: InjectedIntl,
    options: IGridAdapterOptions = {},
): IAgGridPage {
    const { addLoadingRenderer = null } = options;
    const headerItems = dv.headerItems();
    const dimensions = dv.definition.dimensions;

    const { rowHeaders, rowFields, colFields, allHeaders } = headers;

    if (addLoadingRenderer) {
        const leafColumnDefs = getTreeLeaves(allHeaders);
        if (leafColumnDefs[0]) {
            leafColumnDefs[0].cellRenderer = addLoadingRenderer;
        }
    }

    const minimalRowData: DataValue[][] = getMinimalRowData(dv.twoDimData(), headerItems[0]);

    const subtotalStyles = getSubtotalStyles(dimensions ? dimensions[0] : null);
    const rowData = minimalRowData.map((dataRow: DataValue[], dataRowIndex: number) =>
        getRow(dataRow, dataRowIndex, colFields, rowHeaders, headerItems[0], subtotalStyles, intl),
    );

    const columnKeys = [...rowFields, ...colFields];

    const rowTotals = getRowTotals(dv, columnKeys, intl);

    return {
        columnDefs: allHeaders,
        rowData,
        rowTotals,
    };
}

export class NewAgGridAdapter implements IDatasource {
    public rowCount: number | undefined;
    private destroyed: boolean = false;
    private currentResult: IExecutionResult;
    private dataPromises: Array<Promise<IDataView>> = [];

    constructor(
        private readonly tableHeaders: TableHeaders,
        // @ts-ignore
        private readonly initialDv: DataViewFacade,
        private readonly gridApiProvider: GridApiProvider,
        private readonly groupingProvider: GroupingProviderProvider,
        private readonly callbacks: DatasourceCallbacks,
        private readonly intl: InjectedIntl,
    ) {
        this.rowCount = initialDv.firstDimSize();
        this.currentResult = initialDv.result();
    }

    private onDestroy = (): void => {
        // tslint:disable-next-line:no-console
        console.log("cleaning up data source");

        this.dataPromises = [];
    };

    public destroy = (): void => {
        if (this.destroyed) {
            // tslint:disable-next-line:no-console
            console.log("cleaning up data source");

            // TODO: see if this is still needed
            return;
        }

        this.destroyed = true;
        this.onDestroy();
    };

    public getRows = (params: IGetRowsParams): void => {
        const { startRow, endRow, successCallback, failCallback, sortModel } = params;

        if (isInvalidGetRowsRequest(startRow, this.gridApiProvider())) {
            failCallback();

            return;
        }

        /*
         * This seems to trigger re-render of column/row headers, thus ensuring that sort indicators
         * are shown correctly.
         */
        this.gridApiProvider().refreshHeader();

        console.log(JSON.stringify(sortModel, null, 4));
        // TODO: verify sorts are the same. if not, transform existing result with new sorts & re-execute and
        //  get new data view
        // getSortsFromModel(sortModel, execution)

        // TODO: handle addition of totals.. somehow; perhaps the component should be responsible for re-executing
        //  with totals?
        const result = this.currentResult;

        // TODO: identify request to get data from the initial data view (exec def match && first page), then
        //  return data immediately

        const pagePromise = result.readWindow([startRow, 0], [endRow - startRow, undefined]);

        // this.gridApiProvider().setColumnDefs(this.tableHeaders.allHeaders);
        this.dataPromises.push(pagePromise);

        pagePromise.then((dataView: IDataView) => {
            if (!dataView) {
                return null;
            }

            // destroy of the data source cleans up dataPromises array; if that happened, do nothing with
            // whatever was returned by backend
            if (!this.dataPromises.length) {
                return null;
            }

            const dv = new DataViewFacade(dataView);
            const pageData = createRowData(this.tableHeaders, dv, this.intl, {
                addLoadingRenderer: "loadingRenderer",
            });

            const { rowData, rowTotals, columnDefs } = pageData;
            const { offset, count, totalCount } = dataView;

            const rowAttributeIds = columnDefs
                .filter(columnDef => columnDef.type === ROW_ATTRIBUTE_COLUMN)
                .map(columnDef => columnDef.field);

            this.groupingProvider().processPage(rowData, offset[0], rowAttributeIds);

            // RAIL-1130: Backend returns incorrectly total: [1, N], when count: [0, N] and offset: [0, N]
            const lastRow = offset[0] === 0 && count[0] === 0 ? 0 : totalCount[0];

            this.callbacks.onPageLoaded(dv);
            successCallback(rowData, lastRow);

            // set totals
            if (areTotalsChanged(this.gridApiProvider(), rowTotals)) {
                this.gridApiProvider().setPinnedBottomRowData(rowTotals);
            }
        });
    };
}

export function createAgGridDataSource(
    tableHeaders: TableHeaders,
    initialDv: DataViewFacade,
    gridApiProvider: GridApiProvider,
    groupingProvider: GroupingProviderProvider,
    callbacks: DatasourceCallbacks,
    intl: InjectedIntl,
): IDatasource {
    return new NewAgGridAdapter(tableHeaders, initialDv, gridApiProvider, groupingProvider, callbacks, intl);
}

export type GridApiProvider = () => GridApi;
export type GroupingProviderProvider = () => IGroupingProvider;
