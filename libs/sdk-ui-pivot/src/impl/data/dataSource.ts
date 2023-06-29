// (C) 2007-2023 GoodData Corporation
import { IntlShape } from "react-intl";
import { IDataView, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { ColDef, GridApi, IDatasource, IGetRowsParams } from "@ag-grid-community/all-modules";
import { COLS_PER_PAGE } from "../base/constants.js";
import { GroupingProviderFactory, IGroupingProvider } from "./rowGroupingProvider.js";
import { createAgGridPage } from "./rowFactory.js";
import { areTotalsChanged, isInvalidGetRowsRequest } from "./dataSourceUtils.js";
import isEqual from "lodash/isEqual.js";
import {
    attributeLocalId,
    bucketAttribute,
    defTotals,
    dimensionSetTotals,
    isAttributeSort,
    ISortItem,
    ITotal,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";
import { TableDescriptor } from "../structure/tableDescriptor.js";
import { OnExecutionTransformed, OnTransformedExecutionFailed } from "../privateTypes.js";

export type DatasourceConfig = {
    tableDescriptor: TableDescriptor;
    getGroupRows: () => boolean;
    getColumnTotals: () => ITotal[];
    getRowTotals: () => ITotal[];
    onPageLoaded: OnPageLoaded;
    onExecutionTransformed: OnExecutionTransformed;
    onTransformedExecutionFailed: OnTransformedExecutionFailed;
    dataViewTransform: (dv: IDataView) => IDataView;
};
export type OnPageLoaded = (dv: DataViewFacade) => void;

export function createAgGridDatasource(
    config: DatasourceConfig,
    initialDv: DataViewFacade,
    gridApiProvider: GridApiProvider,
    intl: IntlShape,
): AgGridDatasource {
    return new AgGridDatasource(config, initialDv, gridApiProvider, intl);
}

export type GridApiProvider = () => GridApi | undefined;

export class AgGridDatasource implements IDatasource {
    public rowCount: number | undefined;
    private destroyed: boolean = false;
    private currentResult: IExecutionResult;
    private currentSorts: ISortItem[];
    private grouping: IGroupingProvider;

    constructor(
        private readonly config: DatasourceConfig,
        private readonly initialDv: DataViewFacade,
        private readonly gridApiProvider: GridApiProvider,
        private readonly intl: IntlShape,
    ) {
        this.currentResult = initialDv.result();
        this.currentSorts = initialDv.meta().effectiveSortItems();

        // we do not have a sortModel yet so we need to check the dataView itself if the sorting makes sense
        const isInitialDvSortedByFirstAttribute = isDataViewSortedByFirstAttribute(initialDv);

        this.grouping = this.createGroupingProvider(isInitialDvSortedByFirstAttribute);
    }

    private createGroupingProvider = (isSortedByFirst: boolean) => {
        // grouping happens under two conditions: it is desired & the data is sorted by first column
        const shouldGroup = this.config.getGroupRows() && isSortedByFirst;

        return GroupingProviderFactory.createProvider(shouldGroup);
    };

    private resetGroupingProvider = (sortModel: ColDef[] = []): void => {
        const isSortedByFirst = isSortedByFirstAttribute(this.config.tableDescriptor, sortModel);

        this.grouping = this.createGroupingProvider(isSortedByFirst);
    };

    private onDestroy = (): void => {
        //
    };

    private processData = (dv: DataViewFacade, params: IGetRowsParams): void => {
        if (!dv) {
            return;
        }

        const { successCallback } = params;

        const pageData = createAgGridPage(dv, this.config.tableDescriptor, this.intl);

        const { rowData, rowTotals } = pageData;
        const { offset, count, totalCount } = dv.dataView;
        const rowAttributeIds = this.config.tableDescriptor.headers.sliceCols.map((header) => header.id);

        this.grouping.processPage(rowData, offset[0], rowAttributeIds);

        // RAIL-1130: Backend returns incorrectly total: [1, N], when count: [0, N] and offset: [0, N]
        const lastRow = offset[0] === 0 && count[0] === 0 ? 0 : totalCount[0];

        this.config.onPageLoaded(dv);
        successCallback(rowData, lastRow);

        /**
         * In version 25 ag-grid has much better logic that detects which cells need to be refreshed.
         * Unfortunately, this breaks row grouping because cells outside of the currently loaded page are not redrawn.
         * This is a problem, because the newly loaded page might change the grouping status of cells outside of the loaded page.
         * So we force a cell refresh to redraw all the cells with the up-to-date grouping CSS classes.
         * This basically reverts the improved logic in the new ag-grid and behaves very closely to ag-grid 22.
         */
        this.gridApiProvider()?.refreshCells({ force: true, suppressFlash: true });

        // set totals
        if (areTotalsChanged(this.gridApiProvider(), rowTotals)) {
            this.gridApiProvider()?.setPinnedBottomRowData(rowTotals);
        }
    };

    private transformResult = (
        params: IGetRowsParams,
        desiredSorts: ISortItem[],
        desiredTotals: ITotal[],
        desiredRowTotals: ITotal[],
    ): void => {
        const { sortModel } = params;
        const result = this.currentResult;
        const definition = result.definition;
        /*
         * This seems to trigger re-render of column/row headers, thus ensuring that sort indicators
         * are shown correctly.
         */
        this.gridApiProvider()?.refreshHeader();

        /*
         * Grouping provider is stateful, keeps accumulating info about pages; now that the pages
         * fundamentally change due to re-exec, the grouping provider must be reset as well.
         */
        this.resetGroupingProvider(sortModel);

        const transformedExecution = result
            .transform()
            .withSorting(...(desiredSorts ?? []))
            .withDimensions(
                dimensionSetTotals(definition.dimensions[0], desiredTotals),
                dimensionSetTotals(definition.dimensions[1], desiredRowTotals),
            );

        this.config.onExecutionTransformed(transformedExecution);
        this.driveExecutionAndUpdateDatasource(transformedExecution, params);
    };

    private driveExecutionAndUpdateDatasource = (
        execution: IPreparedExecution,
        params: IGetRowsParams,
    ): void => {
        const { startRow, endRow, failCallback } = params;

        execution
            .execute()
            .then((newResult) => {
                this.currentResult = newResult;

                newResult
                    .readWindow([startRow, 0], [endRow - startRow, COLS_PER_PAGE])
                    .then((data) => {
                        const dataView = this.config.dataViewTransform(data);
                        const dv = DataViewFacade.for(dataView);
                        this.gridApiProvider()?.setRowCount(dataView.totalCount[0]);
                        this.currentSorts = dv.meta().effectiveSortItems();

                        // Table descriptors contain information about effective totals (e.g. totals set for the
                        // table right now). After redrive of execution to change sorts/totals, code must make
                        // sure that the new settings are reflected in the table descriptor.
                        const emptyValue = emptyHeaderTitleFromIntl(this.intl);
                        this.config.tableDescriptor = TableDescriptor.for(dv, emptyValue, this.intl);

                        this.processData(dv, params);
                    })
                    .catch((err) => {
                        this.config.onTransformedExecutionFailed();

                        console.error("Error while doing execution to obtain data view", err);

                        failCallback();
                    });
            })
            .catch((err) => {
                this.config.onTransformedExecutionFailed();

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
        const desiredSorts = this.config.tableDescriptor.createSortItems(
            sortModel ?? [],
            result.definition.sortBy,
        );
        const currentTotals = defTotals(definition, 0);
        const desiredTotals = this.config.getColumnTotals();

        const currentRowTotals = defTotals(definition, 1);
        const desiredRowTotals = this.config.getRowTotals();

        if (
            !isEqual(this.currentSorts, desiredSorts) ||
            !isEqual(currentTotals, desiredTotals) ||
            !isEqual(currentRowTotals, desiredRowTotals)
        ) {
            this.transformResult(params, desiredSorts, desiredTotals, desiredRowTotals);
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
                .then((data) => {
                    const dataView = this.config.dataViewTransform(data);
                    this.processData(DataViewFacade.for(dataView), params);
                })
                .catch((err) => {
                    console.error("Error while doing execution to obtain data view", err);

                    failCallback();
                });
        }
    };

    public getGroupingProvider = (): IGroupingProvider => {
        return this.grouping;
    };
}

function isSortedByFirstAttribute(tableDescriptor: TableDescriptor, sortingCols: ColDef[]): boolean {
    if (!sortingCols.length) {
        // this is somewhat dangerous assumption: no explicit sort == sorted by first col
        //  (bear and tiger backend behaves thusly)
        return true;
    }

    if (sortingCols.length > 1) {
        return false;
    }

    return tableDescriptor.isFirstCol(sortingCols[0].colId!);
}

function isDataViewSortedByFirstAttribute(dv: DataViewFacade): boolean {
    const { sortBy } = dv.definition;
    if (!sortBy?.length) {
        // this is somewhat dangerous assumption: no explicit sort == sorted by first col
        //  (bear and tiger backend behaves thusly)
        return true;
    }

    if (sortBy.length > 1) {
        return false;
    }

    const firstSortBy = sortBy[0];
    if (!isAttributeSort(firstSortBy)) {
        return false;
    }

    const attributeBucket = dv.def().bucket(BucketNames.ATTRIBUTE);
    if (!attributeBucket) {
        return false;
    }

    const firstAttribute = bucketAttribute(attributeBucket);
    if (!firstAttribute) {
        return false;
    }

    return firstSortBy.attributeSortItem.attributeIdentifier === attributeLocalId(firstAttribute);
}
