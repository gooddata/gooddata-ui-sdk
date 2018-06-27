// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Execution } from '@gooddata/typings';

import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';

import { visualizationIsBetaWarning } from '../../helpers/utils';
import { executionToAGGridAdapter, IGridHeader } from '../../helpers/agGrid';

export interface IAGTableProps {
    executionResult: any;
}

export interface IAGTableState {
    columnDefs: IGridHeader[];
    rowData: Execution.DataValue[][][];
}

export class AGTable extends React.Component<IAGTableProps, any> {
    constructor(props: IAGTableProps) {
        super(props);
        this.state = {
            columnDefs: [],
            rowData: []
        } as any;
        visualizationIsBetaWarning();
    }

    public componentWillMount() {
        const { executionResult } = this.props;
        const { columnDefs, rowData } = executionToAGGridAdapter(executionResult);
        this.setState({
            columnDefs,
            rowData
        });
    }

    public render() {
        const { columnDefs, rowData } = this.state;

        const gridOptions = {
            // frameworkComponents: {
            //     agColumnHeader: RowHeader,
            //     agColumnGroupHeader: ColumnHeader
            // },
            // groupMultiAutoColumn: 2,
            // groupSuppressAutoColumn: true,
            // groupSuppressRow: true,
            columnDefs,
            rowData,
            // enableRowGroup: true,
            // groupUseEntireRow: true,
            // showToolPanel: true,

            groupDefaultExpanded: -1,
            groupHideOpenParents: true,
            suppressMovableColumns: true,

            // autoGroupColumnDef: {
            //     cellRenderer: 'simpleCellRenderer'
            //     // cellRendererParams: {
            //     //     suppressCount: true,
            //     //     suppressDoubleClickExpand: true
            //     // }
            // },

            // toolbox: true,
            animateRows: true,
            enableRangeSelection: true,
            enableSorting: true,
            enableFilter: true
        };

        return <AgGridReact {...gridOptions} />;
    }
}
