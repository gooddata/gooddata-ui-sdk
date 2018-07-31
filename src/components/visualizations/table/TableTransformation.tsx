// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { noop, pick } from 'lodash';
import { AFM, Execution } from '@gooddata/typings';

import {
    TableHeader,
    TableRow,
    ISortInfo,
    OnSortChangeWithItem,
    ITableTransformationConfig
} from '../../../interfaces/Table';

import { ITableProps, Table } from './Table';

import { getHeaders, getRows, validateTableProportions, getTotalsWithData } from './utils/dataTransformation';
import { getSortInfo, getSortItem } from './utils/sort';

import { IIndexedTotalItem, ITotalWithData } from '../../../interfaces/Totals';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { OnFiredDrillEvent } from '../../../interfaces/Events';

export interface ITableTransformationProps {
    afterRender?: Function;
    totals?: IIndexedTotalItem[];
    totalsEditAllowed?: boolean;
    onTotalsEdit?: (indexedTotals: IIndexedTotalItem[]) => void;
    config?: ITableTransformationConfig;
    drillableItems?: IDrillableItem[];
    executionRequest: AFM.IExecution;
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    height?: number;
    maxHeight?: number;
    onFiredDrillEvent?: OnFiredDrillEvent;
    onSortChange?: OnSortChangeWithItem;
    onDataTooLarge?: Function;
    tableRenderer?: (props: ITableProps) => JSX.Element;
    width?: number;
    lastAddedTotalType?: AFM.TotalType;
    onLastAddedTotalRowHighlightPeriodEnd?: () => void;
}

function renderDefaultTable(props: ITableProps): JSX.Element {
    return <Table {...props} />;
}

export class TableTransformation extends React.Component<ITableTransformationProps> {
    public static defaultProps: Partial<ITableTransformationProps> = {
        afterRender: noop,
        totals: [],
        onTotalsEdit: noop,
        config: {},
        drillableItems: [],
        onFiredDrillEvent: () => true,
        onSortChange: noop,
        tableRenderer: renderDefaultTable,
        onLastAddedTotalRowHighlightPeriodEnd: noop
    };

    public render(): JSX.Element {
        const {
            config,
            drillableItems,
            executionRequest,
            executionResponse,
            executionResult,
            height,
            maxHeight,
            onFiredDrillEvent,
            onSortChange,
            width,
            totals,
            totalsEditAllowed,
            onTotalsEdit,
            afterRender,
            lastAddedTotalType,
            onLastAddedTotalRowHighlightPeriodEnd
        } = this.props;

        const headers: TableHeader[] = getHeaders(executionResponse);
        const rows: TableRow[] = getRows(executionResult);
        const totalsWithData: ITotalWithData[] = getTotalsWithData(totals, executionResult);

        validateTableProportions(headers, rows);

        const sortItem = getSortItem(executionRequest);

        const EMPTY_SORT_INFO: ISortInfo =  { sortBy: undefined, sortDir: undefined };
        const { sortBy, sortDir } = sortItem ? getSortInfo(sortItem, headers) : EMPTY_SORT_INFO;

        const tableProps: ITableProps = {
            ...pick(config, ['rowsPerPage', 'onMore', 'onLess', 'sortInTooltip', 'stickyHeaderOffset']),
            afterRender,
            totalsWithData,
            totalsEditAllowed,
            onTotalsEdit,
            drillableItems,
            executionRequest,
            headers,
            onFiredDrillEvent,
            onSortChange,
            rows,
            sortBy,
            sortDir,
            lastAddedTotalType,
            onLastAddedTotalRowHighlightPeriodEnd
        };

        if (height) {
            tableProps.containerHeight = height;
        }

        if (maxHeight) {
            tableProps.containerMaxHeight = maxHeight;
        }

        if (width) {
            tableProps.containerWidth = width;
        }

        return this.props.tableRenderer(tableProps);
    }
}
