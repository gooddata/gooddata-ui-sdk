// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { noop } from 'lodash';
import { AFM, Execution } from '@gooddata/typings';

import { ITableProps, Table } from './Table';
import { TableControls } from './TableControls';
import { DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT, DEFAULT_FOOTER_ROW_HEIGHT } from './TableVisualization';
import { OnSortChangeWithItem, TableRow } from '../../../interfaces/Table';
import { ITotalWithData } from '../../../interfaces/Totals';

const HEIGHT_PADDING: number = 20;
const BOTTOM_BUTTONS_HEIGHT: number = 31;

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
    executionResponse: Execution.IExecutionResponse;
    containerHeight?: number;
}

export interface IResponsiveTableState {
    page: number;
    pageOffset: number;
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
            page: props.page || 1,
            pageOffset: 0
        };

        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);
        this.setTableRef = this.setTableRef.bind(this);
    }

    public componentWillReceiveProps(nextProps: IResponsiveTableProps): void {
        if (this.props.containerHeight !== nextProps.containerHeight ||
            this.props.totalsWithData.length !== nextProps.totalsWithData.length ||
            this.props.rows.length !== nextProps.rows.length) {
            const rows = this.getRowCount(
                nextProps.page,
                nextProps.rows.length,
                nextProps.totalsWithData.length,
                nextProps.containerHeight,
                nextProps.rowsPerPage
            );
            const page = this.getBasePage(rows);
            this.setState({
                page
            });
        }
    }

    public render(): JSX.Element {
        const { props } = this;

        const tableProps: ITableProps = {
            ...props,
            rows: props.rows.slice(0, this.getRowCount(this.getPage())),
            containerHeight: this.getContainerHeight(),
            containerMaxHeight: this.getContainerMaxHeight(),
            hasHiddenRows: this.hasHiddenRows(),
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
        const pageOffset = this.state.pageOffset + 1;
        this.setState({ pageOffset }, () => {
            const rows = this.getRowCount(this.getPage());
            this.props.onMore({ page: this.getPage(), rows });
        });
    }

    private onLess(): void {
        const pageOffset = 0;
        this.setState({ pageOffset }, () => {
            const rows = this.getRowCount(this.getPage());
            this.props.onLess({ rows });
        });

        const header: ClientRect = this.table.getBoundingClientRect();
        window.scrollTo(window.pageXOffset, window.pageYOffset + header.top);
    }

    private getBasePage(rowsCount: number): number {
        return Math.ceil(rowsCount / this.props.rowsPerPage);
    }

    private getPage(): number {
        return this.state.page + this.state.pageOffset;
    }

    private getRowCount(
        page: number,
        rowsLength: number = this.props.rows.length,
        totalsWithDataLength: number = this.props.totalsWithData.length,
        containerHeight: number = this.props.containerHeight,
        rowsPerPage: number = this.props.rowsPerPage
    ): number {
        const renderedHeight = (rowsPerPage * page * DEFAULT_ROW_HEIGHT) +
            (totalsWithDataLength * DEFAULT_FOOTER_ROW_HEIGHT) +
            DEFAULT_HEADER_HEIGHT + HEIGHT_PADDING;
        if (renderedHeight < containerHeight) {
            const heightDiffInWholeRows = Math.floor((containerHeight - renderedHeight) / DEFAULT_ROW_HEIGHT);
            return Math.min(rowsLength, rowsPerPage * page + heightDiffInWholeRows);
        }
        return Math.min(rowsLength, rowsPerPage * page);
    }

    private getContainerHeight(): number {
        const { rows, totalsWithData } = this.props;

        return (rows.length * DEFAULT_ROW_HEIGHT) +
            (totalsWithData.length * DEFAULT_FOOTER_ROW_HEIGHT) +
            DEFAULT_HEADER_HEIGHT + HEIGHT_PADDING;
    }

    private getContainerMaxHeight(): number {
        const { rows, totalsWithData, containerHeight } = this.props;
        const allDataHeight = (rows.length * DEFAULT_ROW_HEIGHT) +
            (totalsWithData.length * DEFAULT_FOOTER_ROW_HEIGHT) +
            DEFAULT_HEADER_HEIGHT + HEIGHT_PADDING;
        if (containerHeight) {
            const buttonsHeight = this.isMoreButtonVisible() ? (BOTTOM_BUTTONS_HEIGHT + HEIGHT_PADDING) : 0;
            return Math.min(containerHeight - buttonsHeight, allDataHeight);
        }

        return allDataHeight;
    }

    private setTableRef(table: Element): void {
        this.table = table;
    }

    private isMoreButtonVisible(): boolean {
        return this.props.rows.length > this.props.rowsPerPage;
    }

    private isMoreButtonDisabled(): boolean {
        return this.props.rows.length <= this.props.rowsPerPage * (this.getPage());
    }

    private isLessButtonVisible(): boolean {
        return this.state.pageOffset > 0;
    }

    private hasHiddenRows(): boolean {
        return !this.isMoreButtonDisabled() && !this.props.containerHeight;
    }
}
