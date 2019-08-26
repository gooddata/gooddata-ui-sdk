// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import noop = require("lodash/noop");
import pick = require("lodash/pick");
import * as React from "react";
import { convertDrillableItemsToPredicates } from "../../../helpers/headerPredicate";
import { IDrillableItem } from "../../../interfaces/DrillEvents";
import { OnFiredDrillEvent } from "../../../interfaces/Events";
import { IHeaderPredicate } from "../../../interfaces/HeaderPredicate";
import { IMappingHeader } from "../../../interfaces/MappingHeader";

import {
    ISortInfo,
    ITableTransformationConfig,
    OnSortChangeWithItem,
    TableRow,
} from "../../../interfaces/Table";

import { IIndexedTotalItem, ITotalWithData } from "../../../interfaces/Totals";

import { ITableProps, Table } from "./Table";

import { getHeaders, getRows, getTotalsWithData, validateTableProportions } from "./utils/dataTransformation";
import { getSortInfo, getSortItem } from "./utils/sort";

export interface ITableTransformationProps {
    afterRender?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    totals?: IIndexedTotalItem[];
    totalsEditAllowed?: boolean;
    onTotalsEdit?: (indexedTotals: IIndexedTotalItem[]) => void;
    config?: ITableTransformationConfig;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    executionRequest: AFM.IExecution;
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    height?: number;
    maxHeight?: number;
    onFiredDrillEvent?: OnFiredDrillEvent;
    onSortChange?: OnSortChangeWithItem;
    onDataTooLarge?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
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
        onLastAddedTotalRowHighlightPeriodEnd: noop,
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
            onLastAddedTotalRowHighlightPeriodEnd,
        } = this.props;

        const headers: IMappingHeader[] = getHeaders(executionResponse);
        const rows: TableRow[] = getRows(executionResult);
        const totalsWithData: ITotalWithData[] = getTotalsWithData(totals, executionResult);

        const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

        validateTableProportions(headers, rows);

        const sortItem = getSortItem(executionRequest);

        const EMPTY_SORT_INFO: ISortInfo = { sortBy: undefined, sortDir: undefined };
        const { sortBy, sortDir } = sortItem ? getSortInfo(sortItem, headers) : EMPTY_SORT_INFO;

        const tableProps: ITableProps = {
            ...pick(config, [
                "rowsPerPage",
                "onMore",
                "onLess",
                "sortInTooltip",
                "stickyHeaderOffset",
                "separators",
            ]),
            afterRender,
            totalsWithData,
            totalsEditAllowed,
            onTotalsEdit,
            drillablePredicates,
            executionRequest,
            executionResponse,
            headers,
            onFiredDrillEvent,
            onSortChange,
            rows,
            sortBy,
            sortDir,
            lastAddedTotalType,
            onLastAddedTotalRowHighlightPeriodEnd,
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
