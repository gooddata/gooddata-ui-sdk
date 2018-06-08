// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { noop } from 'lodash';
import { AFM } from '@gooddata/typings';

import { ITableProps, Table } from './Table';
import { TableControls } from './TableControls';
import { DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT, DEFAULT_FOOTER_ROW_HEIGHT } from './TableVisualization';
import { OnSortChangeWithItem, TableRow } from '../../../interfaces/Table';
import { ITotalWithData } from '../../../interfaces/Totals';

const HEIGHT_PADDING: number = 20;

const isTouchDevice: boolean = 'ontouchstart' in document.documentElement;

export interface IResponsiveTableProps {
    rows: TableRow[];
    rowsPerPage: number;
    page?: number;
    totalsWithData?: ITotalWithData[];
    onMore?: (onMoreObj: { page: number, rows: number }) => void;
    onLess?: (onLessObj: { rows: number }) => void;
    onSortChange?: OnSortChangeWithItem;
    executionRequest: AFM.IExecution;
}

export interface IResponsiveTableState {
    page: number;
}

export class ResponsiveTable extends React.Component<IResponsiveTableProps, IResponsiveTableState> {
    public static defaultProps: Partial<IResponsiveTableProps> = {
        totalsWithData: [],
        page: 1,
        onMore: noop,
        onLess: noop
    };

    private table: Element;

    constructor(props: IResponsiveTableProps) {
        super(props);
        this.state = {
            page: props.page || 1
        };

        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);
        this.setTableRef = this.setTableRef.bind(this);
    }

    public componentWillReceiveProps(nextProps: IResponsiveTableProps): void {
        if (nextProps.page) {
            this.setState({
                page: nextProps.page
            });
        }
    }

    public render(): JSX.Element {
        const { props } = this;

        const tableProps: ITableProps = {
            ...props,
            rows: props.rows.slice(0, this.getRowCount(this.state.page)),
            containerHeight: this.getContainerMaxHeight(),
            containerMaxHeight: this.getContainerMaxHeight(),
            hasHiddenRows: !this.isMoreButtonDisabled(),
            sortInTooltip: isTouchDevice
        };

        return (
            <div className="gdc-indigo-responsive-table" ref={this.setTableRef}>
                <Table {...tableProps} />
                <TableControls
                    onMore={this.onMore}
                    onLess={this.onLess}
                    isMoreButtonDisabled={this.isMoreButtonDisabled()}
                    isMoreButtonVisible={this.isMoreButtonVisible()}
                    isLessButtonVisible={this.isLessButtonVisible()}
                />
            </div>
        );
    }

    private onMore(): void {
        const page: number = this.state.page + 1;
        this.setState({ page });
        this.props.onMore({ page, rows: this.getRowCount(page) });
    }

    private onLess(): void {
        const page: number = 1;
        this.setState({ page });
        this.props.onLess({ rows: this.getRowCount(page) });

        const header: ClientRect = this.table.getBoundingClientRect();
        window.scrollTo(window.pageXOffset, window.pageYOffset + header.top);
    }

    private getRowCount(page: number): number {
        return Math.min(this.props.rows.length, this.props.rowsPerPage * page);
    }

    private getContainerMaxHeight(): number {
        const { rows, totalsWithData } = this.props;

        return (rows.length * DEFAULT_ROW_HEIGHT) +
            (totalsWithData.length * DEFAULT_FOOTER_ROW_HEIGHT) +
            DEFAULT_HEADER_HEIGHT + HEIGHT_PADDING;
    }

    private setTableRef(table: Element): void {
        this.table = table;
    }

    private isMoreButtonVisible(): boolean {
        return this.props.rows.length > this.props.rowsPerPage;
    }

    private isMoreButtonDisabled(): boolean {
        return this.props.rows.length <= this.props.rowsPerPage * this.state.page;
    }

    private isLessButtonVisible(): boolean {
        return this.state.page > 1;
    }
}
