// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { AFM, Execution } from '@gooddata/typings';

import { visualizationIsBetaWarning } from '../../helpers/utils';
import { executionToAGGridAdapter, IGridHeader } from '../../helpers/agGrid';
import { LoadingComponent } from '../simple/LoadingComponent';
import { IDataSourceProviderInjectedProps } from '../afm/DataSourceProvider';
import {
    visualizationLoadingHOC,
    ILoadingInjectedProps,
    commonDefaultProps
} from './base/VisualizationLoadingHOC';
import { ICommonChartProps } from './base/BaseChart';
import { IDataSource } from '../../interfaces/DataSource';
import { BaseVisualization } from './base/BaseVisualization';

export interface IPivotTableProps extends ICommonChartProps {
    resultSpec?: AFM.IResultSpec;
    dataSource: IDataSource;
    totalsEditAllowed?: boolean;
    getPage: IGetPage;
    pageSize?: number;
}

export interface IPivotTableState {
    columnDefs: IGridHeader[];
    // rowData an an array of different objects depending on the content of the table.
    rowData: any[];
    execution: Execution.IExecutionResponses;
}

export interface IGetRowsParams {
    startRow: number;
    endRow: number;
    successCallback(rowData: any[], lastRow: number): void;
}

export interface IGridDatasource {
    getRows(params: IGetRowsParams): Promise<Execution.IExecutionResponses | null>;
}

export interface IGridApi {
    setDatasource(dataSource: IGridDatasource): void;
}

export interface IGridParams {
    api: IGridApi;
}

export type IGetPage = (
    resultSpec: AFM.IResultSpec,
    limit: number[],
    offset: number[]
) => Promise<Execution.IExecutionResponses | null>;

export type IOnSuccess = (execution: Execution.IExecutionResponses, columnDefs: IGridHeader[]) => void;

export const getGridDataSource = (
    resultSpec: AFM.IResultSpec,
    getPage: IGetPage,
    onSuccess: IOnSuccess
) => ({
    getRows: ({ startRow, endRow, successCallback }: IGetRowsParams) => {
        const pagePromise = getPage(
            resultSpec,
            // column limit defaults to SERVERSIDE_COLUMN_LIMIT (1000), because 1000 columns is hopefully enough.
            [endRow - startRow, undefined],
            // column offset defaults to 0, because we do not support horizontal paging yet
            [startRow, undefined]
        );
        return pagePromise
            .then(
                (execution: Execution.IExecutionResponses | null) => {
                    if (!execution) {
                        return null;
                    }
                    const { columnDefs, rowData } = executionToAGGridAdapter(
                        execution,
                        { addLoadingRenderer: 'loadingRenderer' }
                    );
                    const lastRow = execution.executionResult.paging.total[0];
                    successCallback(rowData, lastRow);
                    onSuccess(execution, columnDefs);
                    return execution;
                }
            );
    }
});

// This is a minimal interface for AG Grid's renderer props. Run Debugger to see full object.
// Imported styles from AG Grid dont seem compatible.
export interface ILoadingRendererProps {
    node: {
        id?: any;
    };
    data?: any[];
    colDef?: {
        field: string
    };
}

export const RowLoadingElement = (props: ILoadingRendererProps) =>
    (props.node.id !== undefined
        ? <span>{props.data[props.colDef.field]}</span>
        : <LoadingComponent width={36} imageHeight={8} height={26} speed={2} />);

export class PivotTableInner extends
        BaseVisualization<
            IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps,
            IPivotTableState
        > {
    public static defaultProps: Partial<IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps> = {
        ...commonDefaultProps,
        onDataTooLarge: noop,
        onLegendReady: noop,
        pageSize: 100
    };

    private gridDataSource: IGridDatasource;
    private gridApi: IGridApi;

    constructor(props: IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps) {
        super(props);
        this.state = {
            columnDefs: [],
            rowData: [],
            execution: null
        };
        this.gridDataSource = null;
        this.gridApi = null;
        visualizationIsBetaWarning();
    }

    public componentWillMount() {
        const { resultSpec, getPage } = this.props;
        this.createDataSource(resultSpec, getPage);
    }

    public componentWillReceiveProps(
        nextProps: IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps
    ) {
        const { resultSpec, getPage } = this.props;
        if (
            !isEqual(resultSpec, nextProps.resultSpec)
            || getPage !== nextProps.getPage
        ) {
            this.createDataSource(resultSpec, getPage);
            this.setGridDataSource();
        }
    }

    public createDataSource = (resultSpec: AFM.IResultSpec, getPage: IGetPage) => {
        const onSuccess = (execution: Execution.IExecutionResponses, columnDefs: IGridHeader[]) => {
            this.setState({ execution, columnDefs });
        };
        this.gridDataSource = getGridDataSource(resultSpec, getPage, onSuccess);
    }

    public onGridReady = (params: IGridParams) => {
        this.gridApi = params.api;
        this.setGridDataSource();
    }

    public setGridDataSource = () => {
        this.gridApi.setDatasource(this.gridDataSource);
    }

    public renderVisualization() {
        const { columnDefs, rowData } = this.state;
        const { pageSize } = this.props;

        const gridOptions = {
            // Initial data
            columnDefs,
            rowData,

            // Basic options
            suppressMovableColumns: true,
            enableSorting: false,
            enableFilter: false,
            enableColResize: true,

            // infinite scrolling model
            rowModelType: 'infinite',
            paginationPageSize: pageSize,
            cacheOverflowSize: pageSize,
            cacheBlockSize: pageSize,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: pageSize,
            maxBlocksInCache: 10,
            onGridReady: this.onGridReady,

            // Custom renderers
            frameworkComponents: {
                // loading indicator
                // any is needed here because of incompatible types with AgGridReact types
                loadingRenderer: RowLoadingElement as any
            }
        };

        // columnDefs are loaded with first page request. Show overlay loading before first page is available.
        const tableLoadingOverlay = columnDefs.length === 0 ? (
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }}
            >
                <LoadingComponent />
            </div>
        ) : null;

        return (
            <div className="ag-theme-balham s-pivot-table" style={{ height: '100%', position: 'relative' }}>
                {tableLoadingOverlay}
                <AgGridReact {...gridOptions} />
            </div>
        );
    }
}

export const PivotTable = visualizationLoadingHOC(PivotTableInner, false);
