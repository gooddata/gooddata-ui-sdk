// (C) 2007-2019 GoodData Corporation
import { IntlShape } from "react-intl";
import { DataViewFacade, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { GridApi, IDatasource, IGetRowsParams } from "ag-grid-community";

import { COLS_PER_PAGE, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import { getSortsFromModel } from "./agGridSorting";
import { DatasourceConfig, ISortModelItem, TableHeaders } from "./agGridTypes";
import { GroupingProviderFactory, IGroupingProvider } from "./GroupingProvider";
import { createRowData } from "./agGridData";
import { areTotalsChanged, isInvalidGetRowsRequest } from "./agGridDataSourceUtils";
import isEqual = require("lodash/isEqual");
import { dimensionSetTotals, ITotal, SortItem, defTotals } from "@gooddata/sdk-model";

export function createAgGridDatasource(
    config: DatasourceConfig,
    initialDv: DataViewFacade,
    gridApiProvider: GridApiProvider,
    intl: IntlShape,
): AgGridDatasource {
    return new AgGridDatasource(config, initialDv, gridApiProvider, intl);
}

export type GridApiProvider = () => GridApi;

export class AgGridDatasource implements IDatasource {
    public rowCount: number | undefined;
    private destroyed: boolean = false;
    private currentResult: IExecutionResult;
    private grouping: IGroupingProvider;

    constructor(
        private readonly config: DatasourceConfig,
        private readonly initialDv: DataViewFacade,
        private readonly gridApiProvider: GridApiProvider,
        private readonly intl: IntlShape,
    ) {
        this.currentResult = initialDv.result();

        this.resetGroupingProvider();
    }

    private resetGroupingProvider = (sortModel: ISortModelItem[] = []): void => {
        const sortedByFirst = isSortedByFirstAttribute(this.config.headers, sortModel);

        // grouping happens under two conditions: it is desired & the data is sorted by first column
        const shouldGroup = this.config.getGroupRows() && sortedByFirst;

        this.grouping = GroupingProviderFactory.createProvider(shouldGroup);
    };

    private onDestroy = (): void => {
        //
    };

    private processData = (dv: DataViewFacade, params: IGetRowsParams): void => {
        if (!dv) {
            return null;
        }

        const { successCallback } = params;

        const pageData = createRowData(this.config.headers, dv, this.intl, {
            addLoadingRenderer: "loadingRenderer",
        });

        const { rowData, rowTotals, columnDefs } = pageData;
        const { offset, count, totalCount } = dv.dataView;

        const rowAttributeIds = columnDefs
            .filter(columnDef => columnDef.type === ROW_ATTRIBUTE_COLUMN)
            .map(columnDef => columnDef.field);

        this.grouping.processPage(rowData, offset[0], rowAttributeIds);

        // RAIL-1130: Backend returns incorrectly total: [1, N], when count: [0, N] and offset: [0, N]
        const lastRow = offset[0] === 0 && count[0] === 0 ? 0 : totalCount[0];

        this.config.onPageLoaded(dv);
        successCallback(rowData, lastRow);

        // set totals
        if (areTotalsChanged(this.gridApiProvider(), rowTotals)) {
            this.gridApiProvider().setPinnedBottomRowData(rowTotals);
        }
    };

    private transformResult = (
        params: IGetRowsParams,
        desiredSorts: SortItem[],
        desiredTotals: ITotal[],
    ): void => {
        const { startRow, endRow, failCallback, sortModel } = params;
        const result = this.currentResult;
        const definition = result.definition;
        /*
         * This seems to trigger re-render of column/row headers, thus ensuring that sort indicators
         * are shown correctly.
         */
        this.gridApiProvider().refreshHeader();

        /*
         * Grouping provider is stateful, keeps accumulating info about pages; now that the pages
         * fundamentally change due to re-exec, the grouping provider must be reset as well.
         */
        this.resetGroupingProvider(sortModel);

        result
            .transform()
            .withSorting(...desiredSorts)
            .withDimensions(
                dimensionSetTotals(definition.dimensions[0], desiredTotals),
                definition.dimensions[1],
            )
            .execute()
            .then(newResult => {
                this.currentResult = newResult;

                newResult
                    .readWindow([startRow, 0], [endRow - startRow, undefined])
                    .then(data => {
                        this.gridApiProvider().setInfiniteRowCount(data.totalCount[0]);
                        this.processData(new DataViewFacade(data), params);
                    })
                    .catch(err => {
                        // tslint:disable-next-line:no-console
                        console.error("Error while doing execution to obtain data view", err);

                        failCallback();
                    });
            })
            .catch(err => {
                // tslint:disable-next-line:no-console
                console.error("Error while doing execution to obtain transformed results", err);

                failCallback();
            });
    };

    public destroy = (): void => {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.onDestroy();
    };

    public getRows = (params: IGetRowsParams): void => {
        const { startRow, endRow, failCallback, sortModel } = params;

        if (isInvalidGetRowsRequest(startRow, this.gridApiProvider())) {
            failCallback();

            return;
        }

        const result = this.currentResult;
        const definition = result.definition;
        const currentSorts = definition.sortBy;
        const desiredSorts = getSortsFromModel(sortModel, result);
        const currentTotals = defTotals(definition, 0);
        const desiredTotals = this.config.getColumnTotals();

        if (!isEqual(currentSorts, desiredSorts) || !isEqual(currentTotals, desiredTotals)) {
            this.transformResult(params, desiredSorts, desiredTotals);
        } else if (!startRow && result.definition === this.initialDv.definition) {
            /*
             * > Loading first page of data
             *
             * AND
             *
             * > Exec definition of the effective result to get data from is same as the exec definition of the
             * initial data view that was used to construct the table and its data source.
             *
             * ===
             *
             * can reuse the initial data view
             *
             */
            this.processData(this.initialDv, params);
        } else {
            result
                .readWindow([startRow, 0], [endRow - startRow, COLS_PER_PAGE])
                .then(data => {
                    this.processData(new DataViewFacade(data), params);
                })
                .catch(err => {
                    // tslint:disable-next-line:no-console
                    console.error("Error while doing execution to obtain data view", err);

                    failCallback();
                });
        }
    };

    public getGroupingProvider = (): IGroupingProvider => {
        return this.grouping;
    };
}

function isSortedByFirstAttribute(headers: TableHeaders, sortModel: ISortModelItem[]): boolean {
    if (!sortModel.length) {
        // this is somewhat dangerous assumption: no explicit sort == sorted by first col
        //  (bear backend behaves thusly)
        return true;
    }

    if (sortModel.length > 1) {
        return false;
    }

    return headers.allHeaders[0].field === sortModel[0].colId;
}
