// (C) 2007-2019 GoodData Corporation
import { AFM, Execution, VisualizationObject } from '@gooddata/typings';
import {
    ColDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    SortChangedEvent
} from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import { CellClassParams } from 'ag-grid/dist/lib/entities/colDef';
import * as classNames from 'classnames';
import * as invariant from 'invariant';
import * as React from 'react';
import * as CustomEvent from 'custom-event';

import get = require('lodash/get');
import isEqual = require('lodash/isEqual');
import noop = require('lodash/noop');
import cloneDeep = require('lodash/cloneDeep');
import sortBy = require('lodash/sortBy');
import sumBy = require('lodash/sumBy');

import InjectedIntl = ReactIntl.InjectedIntl;
import InjectedIntlProps = ReactIntl.InjectedIntlProps;

import '../../../styles/css/pivotTable.css';

import { VisualizationTypes } from '../../constants/visualizationTypes';
import {
    assortDimensionHeaders,
    COLUMN_ATTRIBUTE_COLUMN,
    executionToAGGridAdapter,
    getRowNodeId,
    getIdsFromUri,
    getParsedFields,
    ID_SEPARATOR,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
    ROW_TOTAL
} from '../../helpers/agGrid';
import { convertDrillableItemsToPredicates, isSomeHeaderPredicateMatched } from '../../helpers/headerPredicate';
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri
} from '../../helpers/mappingHeader';

import { getCellClassNames, getMeasureCellFormattedValue, getMeasureCellStyle } from '../../helpers/tableCell';
import { IColumnDefOptions, IGridCellEvent, IGridHeader, IGridRow } from '../../interfaces/AGGrid';

import { IDrillEvent, IDrillEventContextTable, IDrillEventIntersectionElement } from '../../interfaces/DrillEvents';
import { IHeaderPredicate } from '../../interfaces/HeaderPredicate';
import { IMappingHeader, isMappingHeaderAttributeItem } from '../../interfaces/MappingHeader';
import { IPivotTableConfig, IMenuAggregationClickConfig } from '../../interfaces/PivotTable';
import { IDataSourceProviderInjectedProps } from '../afm/DataSourceProvider';
import { LoadingComponent } from '../simple/LoadingComponent';
import { AVAILABLE_TOTALS as renderedTotalTypesOrder } from '../visualizations/table/totals/utils';

import { getMasterMeasureObjQualifier } from '../../helpers/afmHelper';
import { getScrollbarWidth } from '../../helpers/domUtils';
import { createDrillIntersectionElement } from '../visualizations/utils/drilldownEventing';

import { ICommonChartProps } from './base/BaseChart';
import { BaseVisualization } from './base/BaseVisualization';

import {
    commonDefaultProps,
    IGetPage,
    ILoadingInjectedProps,
    visualizationLoadingHOC
} from './base/VisualizationLoadingHOC';
import ColumnGroupHeader from './pivotTable/ColumnGroupHeader';
import ColumnHeader from './pivotTable/ColumnHeader';
import { GroupingProviderFactory, IGroupingProvider } from './pivotTable/GroupingProvider';
import ApiWrapper from './pivotTable/agGridApiWrapper';

export interface IPivotTableProps extends ICommonChartProps, IDataSourceProviderInjectedProps {
    totals?: VisualizationObject.IVisualizationTotal[];
    getPage?: IGetPage;
    cancelPagePromises?: () => void;
    pageSize?: number;
    config?: IPivotTableConfig;
    groupRows?: boolean;
    onDataSourceUpdateSuccess?: () => void;
}

export interface IPivotTableState {
    columnDefs: ColDef[];
    // rowData an an array of different objects depending on the content of the table.
    rowData: IGridRow[];
    execution: Execution.IExecutionResponses;
    columnTotals: AFM.ITotalItem[];
    agGridRerenderNumber: number;
    desiredHeight: number | undefined;
    sortedByFirstAttribute: boolean;
}

export interface ICustomGridOptions extends GridOptions {
    enableMenu?: boolean;
}

const AG_NUMERIC_CELL_CLASSNAME = 'ag-numeric-cell';
const AG_NUMERIC_HEADER_CLASSNAME = 'ag-numeric-header';

export const getDrillRowData = (leafColumnDefs: ColDef[], rowData: { [key: string]: any }) => {
    return leafColumnDefs.reduce((drillRow, colDef: ColDef) => {
        const { type } = colDef;
        // colDef without field is a utility column (e.g. top column label)
        if (colDef.field) {
            if (type === MEASURE_COLUMN) {
                return [...drillRow, rowData[colDef.field]];
            }
            const drillItem = get<any, IMappingHeader>(rowData, ['headerItemMap', colDef.field]);
            if (drillItem && (type === COLUMN_ATTRIBUTE_COLUMN || type === ROW_ATTRIBUTE_COLUMN)) {
                const drillItemUri = getMappingHeaderUri(drillItem);
                return [...drillRow, {
                    // Unlike fields, drilling data should not be sanitized, because it is not used in HTML properties
                    id: getIdsFromUri(drillItemUri, false)[1],
                    title: rowData[colDef.field]
                }];
            }
        }
        return drillRow;
    }, []);
};

export const indexOfTreeNode = (
    node: any,
    tree: any,
    matchNode = (nodeA: any, nodeB: any) => (nodeA === nodeB),
    getChildren = (node: any) => ((node && node.children) || []),
    indexes: number[] = []
): number[] => {
    const nodes = Array.isArray(tree) ? [...tree] : [tree];
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        const currentNode = nodes[nodeIndex];
        // match current node
        if (matchNode(currentNode, node)) {
            return [...indexes, nodeIndex];
        }
        // check children
        const childrenMatchIndexes = indexOfTreeNode(
            node,
            getChildren(currentNode),
            matchNode,
            getChildren,
            [...indexes, nodeIndex]
        );
        if (childrenMatchIndexes !== null) {
            return childrenMatchIndexes;
        }
    }
    return null;
};

export const getTreeLeaves = (tree: any, getChildren = (node: any) => node && node.children) => {
    const leaves = [];
    const nodes = Array.isArray(tree) ? [...tree] : [tree];
    let node;
    let children;
    while (
        // tslint:disable-next-line:no-conditional-assignment ban-comma-operator
        node = nodes.shift(), children = getChildren(node),
        ((children && children.length) || (leaves.push(node) && nodes.length))
    ) {
        if (children) {
            nodes.push(...children);
        }
    }
    return leaves;
};

export const getSortItemByColId = (
    execution: Execution.IExecutionResponses,
    colId: string,
    direction: AFM.SortDirection
): AFM.IMeasureSortItem | AFM.IAttributeSortItem => {
    const { dimensions } = execution.executionResponse;

    const fields = getParsedFields(colId);
    const [lastFieldType, lastFieldId] = fields[fields.length - 1];

    // search columns first when sorting in columns to use the proper header
    // in case the same attribute is in both rows and columns
    const searchDimensionIndex = lastFieldType === 'm' ? 1 : 0;
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders([dimensions[searchDimensionIndex]]);

    if (lastFieldType === 'a') {
        for (const header of attributeHeaders) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                return {
                    attributeSortItem: {
                        direction,
                        attributeIdentifier: header.attributeHeader.localIdentifier
                    }
                };
            }
        }
        invariant(false, `could not find attribute header matching ${colId}`);
    } else if (lastFieldType === 'm') {
        const headerItem = measureHeaderItems[parseInt(lastFieldId, 10)];
        const attributeLocators = fields.slice(0, -1).map((field: string[]) => {
            // first item is type which should be always 'a'
            const [, fieldId, fieldValueId] = field;
            const attributeHeaderMatch = attributeHeaders.find((attributeHeader: Execution.IAttributeHeader) => {
                return getIdsFromUri(attributeHeader.attributeHeader.formOf.uri)[0] === fieldId;
            });
            invariant(
                attributeHeaderMatch,
                `Could not find matching attribute header to field ${field.join(ID_SEPARATOR)}`
            );
            return {
                attributeLocatorItem: {
                    attributeIdentifier: attributeHeaderMatch.attributeHeader.localIdentifier,
                    element: `${attributeHeaderMatch.attributeHeader.formOf.uri}/elements?id=${fieldValueId}`
                }
            };
        });
        return {
            measureSortItem: {
                direction,
                locators: [
                    ...attributeLocators,
                    {
                        measureLocatorItem: {
                            measureIdentifier: headerItem.measureHeaderItem.localIdentifier
                        }
                    }
                ]
            }
        };
    }
    invariant(false, `could not find header matching ${colId}`);
};

export interface ISortModelItem {
    colId: string;
    sort: AFM.SortDirection;
}

export const getSortsFromModel = (
    sortModel: ISortModelItem[], // AgGrid has any, but we can do better
    execution: Execution.IExecutionResponses
) => {
    return sortModel.map((sortModelItem: ISortModelItem) => {
        const { colId, sort } = sortModelItem;
        const sortHeader = getSortItemByColId(execution, colId, sort);
        invariant(sortHeader, `unable to find sort item by field ${colId}`);
        return sortHeader;
    });
};

export const getAGGridDataSource = (
    resultSpec: AFM.IResultSpec,
    getPage: IGetPage,
    cancelPagePromises: () => void,
    getExecution: () => Execution.IExecutionResponses,
    onSuccess: (
        execution: Execution.IExecutionResponses,
        columnDefs: IGridHeader[],
        resultSpec: AFM.IResultSpec
    ) => void,
    getGridApi: () => any,
    intl: InjectedIntl,
    columnDefOptions: IColumnDefOptions = {},
    columnTotals: AFM.ITotalItem[],
    getGroupingProvider: () => IGroupingProvider
): IDatasource => ({
    getRows: ({ startRow, endRow, successCallback, sortModel }: IGetRowsParams) => {
        const execution = getExecution();
        const groupingProvider = getGroupingProvider();

        let resultSpecUpdated: AFM.IResultSpec = resultSpec;
        // If execution is null, this means this is a fresh dataSource and we should ignore current sortModel
        if (sortModel.length > 0 && execution) {
            resultSpecUpdated = {
                ...resultSpecUpdated,
                sorts: getSortsFromModel(sortModel, execution)
            };
        }
        if (columnTotals && columnTotals.length > 0) {
            resultSpecUpdated = {
                ...resultSpecUpdated,
                dimensions: [
                    {
                        ...resultSpecUpdated.dimensions[0],
                        totals: columnTotals
                    },
                    ...resultSpecUpdated.dimensions.slice(1)
                ]
            };
        }

        const pagePromise = getPage(
            resultSpecUpdated,
            // column limit defaults to SERVERSIDE_COLUMN_LIMIT (1000), because 1000 columns is hopefully enough.
            [endRow - startRow, undefined],
            // column offset defaults to 0, because we do not support horizontal paging yet
            [startRow, undefined]
        );
        return pagePromise
            .then((execution: Execution.IExecutionResponses | null) => {
                if (!execution) {
                    return null;
                }

                const { columnDefs, rowData, rowTotals } = executionToAGGridAdapter(
                    execution,
                    resultSpecUpdated,
                    intl,
                    {
                        addLoadingRenderer: 'loadingRenderer',
                        columnDefOptions
                    }
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
                getGridApi().setPinnedBottomRowData(rowTotals);

                return execution;
            });
    },
    destroy: () => {
        cancelPagePromises();
    }
});

export const RowLoadingElement = (props: ICellRendererParams) => {
    // rows that are still loading do not have node.id
    // pinned rows (totals) do not have node.id as well, but we want to render them using the default renderer anyway
    if (props.node.id !== undefined || props.node.rowPinned) {
        // props.value is always unformatted
        // there is props.formattedValue, but this is null for row attributes for some reason
        return <span>{props.formatValue(props.value)}</span>;
    }
    return <LoadingComponent width={36} imageHeight={8} height={26} speed={2} />;
};

export const getDrillIntersection = (
    drillItems: IMappingHeader[],
    afm: AFM.IAfm
): IDrillEventIntersectionElement[] => {
    // Drilling needs refactoring: all '' should be replaced by null (breaking change)
    // intersection consists of
    //     0..1 measure
    //     0..1 row attribute and row attribute value
    //     0..n column attribute and column attribute values
    return drillItems.map((drillItem: IMappingHeader) => {
        let headerLocalIdentifier = null;
        let headerIdentifier = '';
        let uriAndIdentifier = null;

        if (!isMappingHeaderAttributeItem(drillItem)) {
            headerLocalIdentifier = getMappingHeaderLocalIdentifier(drillItem);
            headerIdentifier = getMappingHeaderIdentifier(drillItem) || '';
            uriAndIdentifier = headerLocalIdentifier
                ? getMasterMeasureObjQualifier(afm, headerLocalIdentifier)
                : null;
        }

        const headerUri = getMappingHeaderUri(drillItem) || '';
        const uri = uriAndIdentifier && uriAndIdentifier.uri || headerUri;
        const identifier = uriAndIdentifier && uriAndIdentifier.identifier || headerIdentifier;
        const id = headerLocalIdentifier || headerIdentifier;

        return createDrillIntersectionElement(id, getMappingHeaderName(drillItem), uri, identifier);
    });
};

function isMeasureColumnReadyToRender(params: any, execution: Execution.IExecutionResponses): boolean {
    return Boolean(
        params
        && params.value !== undefined
        && execution
        && execution.executionResponse
    );
}

function getMeasureFormat(gridHeader: IGridHeader, execution: Execution.IExecutionResponses): string {
    const headers = execution.executionResponse.dimensions[1].headers;
    const header = headers[headers.length - 1];

    if (!Execution.isMeasureGroupHeader(header)) {
        throw new Error(`Cannot get measure format from header ${Object.keys(header)}`);
    }

    const measureIndex = gridHeader.measureIndex;
    return header.measureGroupHeader.items[measureIndex].measureHeaderItem.format;
}

export type IPivotTableInnerProps = IPivotTableProps &
    ILoadingInjectedProps &
    IDataSourceProviderInjectedProps &
    InjectedIntlProps;

interface ISortedByColumnIndexes {
    attributes: number[];
    all: number[];
}

export class PivotTableInner extends BaseVisualization<IPivotTableInnerProps, IPivotTableState> {
    public static defaultProps: Partial<IPivotTableInnerProps> = {
        ...commonDefaultProps,
        // This prop is optional if you handle nativeTotals through pushData like in appComponents PluggablePivotTable
        updateTotals: noop,
        onDataTooLarge: noop,
        onDataSourceUpdateSuccess: noop,
        pageSize: 100,
        config: {},
        groupRows: false
    };

    private agGridDataSource: IDatasource;
    private gridApi: GridApi;
    private containerRef: HTMLDivElement;
    private groupingProvider: IGroupingProvider;

    constructor(props: IPivotTableInnerProps) {
        super(props);

        this.state = {
            columnDefs: [],
            rowData: [],

            execution: null,
            columnTotals: cloneDeep(this.getColumnTotalsFromResultSpec(this.props.resultSpec)),
            agGridRerenderNumber: 1,
            desiredHeight: props.config.maxHeight,

            sortedByFirstAttribute: true
        };

        this.agGridDataSource = null;
        this.gridApi = null;

        this.setGroupingProvider(props.groupRows);
    }

    public componentWillMount() {
        this.createAGGridDataSource();
    }

    public componentWillUpdate(nextProps: IPivotTableInnerProps, nextState: IPivotTableState) {
        if (
            this.props.groupRows !== nextProps.groupRows ||
            this.state.sortedByFirstAttribute !== nextState.sortedByFirstAttribute
        ) {
            this.setGroupingProvider(nextProps.groupRows && nextState.sortedByFirstAttribute);
        }
    }

    public componentDidUpdate(prevProps: IPivotTableInnerProps, prevState: IPivotTableState) {
        const prevPropsTotals = this.getColumnTotalsFromResultSpec(prevProps.resultSpec);
        const currentPropsTotals = this.getColumnTotalsFromResultSpec(this.props.resultSpec);
        const totalsPropsChanged = !isEqual(prevPropsTotals, currentPropsTotals);

        const prevStateTotals = prevState.columnTotals;
        const currentStateTotals = this.state.columnTotals;
        const totalsStateChanged = !isEqual(prevStateTotals, currentStateTotals);

        new Promise((resolve) => {
            if (totalsPropsChanged) {
                this.setState({
                    columnTotals: currentPropsTotals
                }, resolve);
            } else {
                resolve();
            }
        }).then(() => {
            let agGridDataSourceUpdateNeeded = false;
            if (totalsStateChanged) {
                this.props.updateTotals(this.state.columnTotals);
                agGridDataSourceUpdateNeeded = true;
            }
            if (this.isNewAGGridDataSourceNeeded(prevProps)) {
                this.groupingProvider.reset();
                agGridDataSourceUpdateNeeded = true;
            }
            if (agGridDataSourceUpdateNeeded) {
                this.updateAGGridDataSource();
            }
        });

        if (this.isAgGridRerenderNeeded(this.props, prevProps)) {
            this.forceRerender();
        }
    }

    /**
     * getCellClass returns class for drillable cells. (maybe format in the future as well)
     */
    public getCellClass = (classList: string) => (cellClassParams: CellClassParams): string => {
        const { dataSource, execution: { executionResponse } } = this.props;
        const { rowIndex } = cellClassParams;
        const colDef = cellClassParams.colDef as IGridHeader;
        const drillablePredicates = this.getDrillablePredicates();
        // return none if no drillableItems are specified

        const afm: AFM.IAfm = dataSource.getAfm();

        let hasDrillableHeader = false;
        const isRowTotal = get(cellClassParams, ['data', 'type', ROW_TOTAL]);
        if (drillablePredicates.length !== 0 && !isRowTotal) {

            const rowDrillItem =
                get<CellClassParams, IMappingHeader>(cellClassParams, ['data', 'headerItemMap', colDef.field]);
            const headers: IMappingHeader[] = rowDrillItem ? [...colDef.drillItems, rowDrillItem] : colDef.drillItems;

            hasDrillableHeader = headers.some((drillItem: IMappingHeader) =>
                isSomeHeaderPredicateMatched(drillablePredicates, drillItem, afm, executionResponse));
        }

        const attributeId = colDef.field;
        const isPinnedRow = cellClassParams.node.isRowPinned();
        const hiddenCell = !isPinnedRow && this.groupingProvider.isRepeated(attributeId, rowIndex);
        const rowSeparator = !hiddenCell && this.groupingProvider.isGroupBoundary(rowIndex);

        return classNames(
            classList,
            getCellClassNames(rowIndex, colDef.index, hasDrillableHeader),
            colDef.index !== undefined ? `gd-column-index-${colDef.index}` : null,
            colDef.measureIndex !== undefined ? `gd-column-measure-${colDef.measureIndex}` : null,
            isRowTotal ? 'gd-row-total' : null,
            hiddenCell ? 'gd-cell-hide s-gd-cell-hide' : null,
            rowSeparator ? 'gd-table-row-separator s-gd-table-row-separator' : null
        );
    }

    public getHeaderClass = (classList: string) => (headerClassParams: any): string => {
        const colDef: IGridHeader = headerClassParams.colDef;
        const { field, measureIndex } = colDef;
        const treeIndexes = colDef ? indexOfTreeNode(
            colDef,
            this.state.columnDefs,
            (nodeA, nodeB) => nodeA.field !== undefined && nodeA.field === nodeB.field
        ) : null;
        const colGroupIndex = treeIndexes
            ? treeIndexes[treeIndexes.length - 1]
            : null;
        const isFirstColumn = treeIndexes !== null && !treeIndexes.some(index => index !== 0);

        return classNames(
            classList,
            'gd-column-group-header',
            colGroupIndex !== null ? `gd-column-group-header-${colGroupIndex}` : null,
            colGroupIndex !== null ? `s-table-measure-column-header-group-cell-${colGroupIndex}` : null,
            measureIndex !== null ? `s-table-measure-column-header-cell-${measureIndex}` : null,
            !field ? 'gd-column-group-header--empty' : null,
            isFirstColumn ? 'gd-column-group-header--first' : null
        );
    }

    public getExecution = () => {
        return this.state.execution;
    }

    public createAGGridDataSource() {
        const onSuccess = (
            execution: Execution.IExecutionResponses,
            columnDefs: IGridHeader[],
            resultSpec: AFM.IResultSpec
        ) => {
            if (!isEqual(columnDefs, this.state.columnDefs)) {
                const sortedByFirstAttribute = this.isSortedByFirstAttibute(columnDefs, resultSpec);
                this.setState({
                    columnDefs,
                    sortedByFirstAttribute
                });
            }
            if (!isEqual(execution, this.state.execution)) {
                this.setState({
                    execution
                });
            }
            const aggregationCount = sumBy(execution.executionResult.totals, total => total.length);
            const totalRowCount = execution.executionResult.paging.total[0];
            this.updateDesiredHeight(totalRowCount, aggregationCount);
            this.props.onDataSourceUpdateSuccess();
        };

        this.agGridDataSource = getAGGridDataSource(
            this.props.resultSpec,
            this.props.getPage,
            this.props.cancelPagePromises,
            this.getExecution,
            onSuccess,
            this.getGridApi,
            this.props.intl,
            {},
            this.state.columnTotals,
            () => this.groupingProvider
        );
    }

    public getGridApi = () => this.gridApi;

    public onGridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
        this.setGridDataSource();
    }

    public setGridDataSource() {
        this.setState({ execution: null });
        if (this.gridApi) {
            this.gridApi.setDatasource(this.agGridDataSource);
        }
    }

    public cellClicked = (cellEvent: IGridCellEvent) => {
        const { onFiredDrillEvent, execution: { executionResponse } } = this.props;
        const { columnDefs } = this.state;
        const afm: AFM.IAfm = this.props.dataSource.getAfm();
        const drillablePredicates = this.getDrillablePredicates();

        const { colDef, rowIndex } = cellEvent;
        const isRowTotal = get<IGridCellEvent, string>(cellEvent, ['data', 'type', ROW_TOTAL]);
        const rowDrillItem = get<IGridCellEvent, IMappingHeader>(cellEvent, ['data', 'headerItemMap', colDef.field]);
        const drillItems: IMappingHeader[] = rowDrillItem ? [...colDef.drillItems, rowDrillItem] : colDef.drillItems;
        const drillableHeaders = drillItems.filter((drillItem: IMappingHeader) =>
            isSomeHeaderPredicateMatched(drillablePredicates, drillItem, afm, executionResponse));

        if (isRowTotal || drillableHeaders.length === 0) {
            return false;
        }

        const leafColumnDefs = getTreeLeaves(columnDefs);
        const columnIndex = leafColumnDefs.findIndex(gridHeader => gridHeader.field === colDef.field);
        const row = getDrillRowData(leafColumnDefs, cellEvent.data);
        const intersection = getDrillIntersection(drillItems, afm);

        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: 'cell',
            columnIndex,
            rowIndex,
            row,
            intersection
        };
        const drillEvent: IDrillEvent = {
            executionContext: afm,
            drillContext
        };

        if (onFiredDrillEvent(drillEvent)) {
            // This is needed for /analyze/embedded/ drilling with post message
            // tslint:disable-next-line:max-line-length
            // More info: https://github.com/gooddata/gdc-analytical-designer/blob/develop/test/drillEventing/drillEventing_page.html
            const event = new CustomEvent('drill', {
                detail: drillEvent,
                bubbles: true
            });
            cellEvent.event.target.dispatchEvent(event);
            return true;
        }
        return false;
    }

    public onMenuAggregationClick = ({
        type,
        measureIdentifiers,
        attributeIdentifier,
        include
    }: IMenuAggregationClickConfig) => {
        const columnTotals = this.getColumnTotals();

        const columnTotalsChanged: AFM.ITotalItem[] = [];
        for (const measureIdentifier of measureIdentifiers) {
            columnTotalsChanged.push({ type, measureIdentifier, attributeIdentifier });
        }

        let updatedColumnTotals = [];
        if (include) {
            const columnTotalsChangedUnique = columnTotalsChanged
                .filter(totalChanged => !columnTotals.some(total => isEqual(total, totalChanged)));

            updatedColumnTotals = [...columnTotals, ...columnTotalsChangedUnique];
        } else {
            updatedColumnTotals = columnTotals
                .filter(total => !columnTotalsChanged.find(totalChanged => isEqual(totalChanged, total)));
        }

        const newColumnTotals = sortBy(updatedColumnTotals, (total) => {
            return renderedTotalTypesOrder.findIndex(rankedItem => rankedItem === total.type);
        });

        this.props.pushData({
            properties: {
                totals: newColumnTotals
            }
        });
        this.setState({ columnTotals: newColumnTotals });
    }

    public sortChanged = (event: SortChangedEvent): void => {
        const execution = this.getExecution();

        invariant(execution !== undefined, 'changing sorts without prior execution cannot work');

        const sortModel: ISortModelItem[] = event.columnApi.getAllColumns()
            .filter(col => col.getSort() !== undefined && col.getSort() !== null)
            .map(col => ({ colId: col.getColId(), sort: col.getSort() as AFM.SortDirection }));

        const sortItems = getSortsFromModel(sortModel, execution);

        this.props.pushData({
            properties: {
                sortItems
            }
        });
    }

    public renderVisualization() {
        const { columnDefs, rowData, desiredHeight } = this.state;
        const { pageSize } = this.props;

        const separators = get(this.props, ['config', 'separators'], undefined);
        const menu = get(this.props, ['config', 'menu']);

        const commonHeaderComponentParams = {
            onMenuAggregationClick: this.onMenuAggregationClick,
            getExecutionResponse: this.getExecutionResponse,
            getColumnTotals: this.getColumnTotals,
            intl: this.props.intl
        };

        const gridOptions: ICustomGridOptions = {
            // Initial data
            columnDefs,
            rowData,

            defaultColDef: {
                cellClass: this.getCellClass(null),
                headerComponentFramework: ColumnHeader as any,
                headerComponentParams: {
                    menu,
                    ...commonHeaderComponentParams
                },
                minWidth: 50
            },
            defaultColGroupDef: {
                headerClass: this.getHeaderClass(null),
                children: [],
                headerGroupComponentFramework: ColumnGroupHeader as any,
                headerGroupComponentParams: {
                    menu,
                    ...commonHeaderComponentParams
                }
            },
            onCellClicked: this.cellClicked,
            onSortChanged: this.sortChanged,

            // Basic options
            suppressMovableColumns: true,
            suppressCellSelection: true,
            enableFilter: false,
            enableColResize: true,
            enableServerSideSorting: true,

            // infinite scrolling model
            rowModelType: 'infinite',
            paginationPageSize: pageSize,
            cacheOverflowSize: pageSize,
            cacheBlockSize: pageSize,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: pageSize,
            maxBlocksInCache: 10,
            onGridReady: this.onGridReady,

            // this provides persistent row selection (if enabled)
            getRowNodeId,

            // Column types
            columnTypes: {
                [ROW_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass('gd-row-attribute-column'),
                    headerClass: this.getHeaderClass('gd-row-attribute-column-header'),
                    colSpan: (params) => {
                        if (
                            // params.data is undefined when rows are in loading state
                            params.data &&
                            params.data.colSpan &&
                            renderedTotalTypesOrder.find(item => item === params.data[params.data.colSpan.headerKey])
                        ) {
                            return params.data.colSpan.count;
                        }
                        return 1;
                    },
                    valueFormatter: (params) => {
                        return params.value === undefined
                            ? null
                            : params.value;
                    }
                },
                [COLUMN_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass('gd-column-attribute-column'),
                    headerClass: this.getHeaderClass('gd-column-attribute-column-header')
                },
                [MEASURE_COLUMN]: {
                    cellClass: this.getCellClass(classNames(
                        AG_NUMERIC_CELL_CLASSNAME, 'gd-measure-column')),
                    headerClass: this.getHeaderClass(classNames(
                        AG_NUMERIC_HEADER_CLASSNAME,
                        'gd-measure-column-header')),
                    // wrong params type from ag-grid, we need any
                    valueFormatter: (params: any) => {
                        return isMeasureColumnReadyToRender(params, this.state.execution)
                            ? getMeasureCellFormattedValue(
                                params.value,
                                getMeasureFormat(params.colDef, this.state.execution),
                                separators
                            )
                            : null;
                    },
                    cellStyle: (params) => {
                        return isMeasureColumnReadyToRender(params, this.state.execution)
                            ? getMeasureCellStyle(
                                params.value,
                                getMeasureFormat(params.colDef, this.state.execution),
                                separators,
                                true
                            )
                            : null;
                    }
                }
            },

            // Custom renderers
            frameworkComponents: {
                // any is needed here because of incompatible types with AgGridReact types
                loadingRenderer: RowLoadingElement as any // loading indicator
            },

            // Custom CSS classes
            rowClass: 'gd-table-row'
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
            <div
                className="gd-table ag-theme-balham s-pivot-table"
                style={{
                    height: desiredHeight || '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                ref={this.setContainerRef}
            >
                {tableLoadingOverlay}
                <AgGridReact
                    {...gridOptions}
                    // To force Ag grid rerender because AFAIK there is no way
                    // to tell Ag grid header cell to rerender
                    key={this.state.agGridRerenderNumber}
                />
            </div>
        );
    }

    private setGroupingProvider(sortedByFirstAttr: boolean) {
        this.groupingProvider = GroupingProviderFactory.createProvider(sortedByFirstAttr);
    }

    private isSortedByFirstAttibute(columnDefs: ColDef[], resultSpec: AFM.IResultSpec): boolean {
        const sortedColumnIndexes: ISortedByColumnIndexes = columnDefs.reduce(
            (
                sortStack: ISortedByColumnIndexes,
                columnDef: ColDef,
                columnIndex: number
            ) => {
                if (columnDef.sort) {
                    sortStack.all.push(columnIndex);
                    if (columnDef.type === ROW_ATTRIBUTE_COLUMN) {
                        sortStack.attributes.push(columnIndex);
                    }
                }
                return sortStack;
            },
            { attributes: [], all: [] }
        );

        const sortedByFirstAttribute = sortedColumnIndexes.attributes[0] === 0 && sortedColumnIndexes.all.length === 1;
        const isSorted = sortedColumnIndexes.all.length > 0 || (resultSpec.sorts && resultSpec.sorts.length > 0);

        return sortedByFirstAttribute || !isSorted;
    }

    private setContainerRef = (container: HTMLDivElement): void => { this.containerRef = container; };

    private getExecutionResponse = () => {
        return this.state.execution ? this.state.execution.executionResponse : null;
    }

    private getColumnTotals = () => {
        return this.state.columnTotals;
    }

    private getColumnTotalsFromResultSpec = (source: AFM.IResultSpec) => {
        return get(source, 'dimensions[0].totals', []);
    }

    private getDrillablePredicates(): IHeaderPredicate[] {
        return convertDrillableItemsToPredicates(this.props.drillableItems);
    }

    private isNewAGGridDataSourceNeeded(prevProps: IPivotTableInnerProps): boolean {
        // cannot compare dataSource using deep equal as it stores execution promises that almost always differ
        const dataSourceChanged = this.props.dataSource.getFingerprint() !== prevProps.dataSource.getFingerprint();

        const dataSourceInvalidatingPropNames = [
            'resultSpec',
            'getPage',
            // drillable items need fresh execution because drillable context for row attribute is kept in rowData
            // It could be refactored to assign drillability without execution,
            // but it would suffer a significant performance hit
            'drillableItems'
        ];

        const dataSourceInvalidatingPropChanged =
            dataSourceInvalidatingPropNames.some(propKey => !isEqual(this.props[propKey], prevProps[propKey]));

        return dataSourceChanged || dataSourceInvalidatingPropChanged;
    }

    private isAgGridRerenderNeeded(props: IPivotTableInnerProps, prevProps: IPivotTableInnerProps): boolean {
        const propsRequiringAgGridRerender = [
            ['config', 'menu']
        ];
        return propsRequiringAgGridRerender.some(
            propKey => !isEqual(get(props, propKey), get(prevProps, propKey))
        );
    }

    private updateAGGridDataSource(): void {
        this.createAGGridDataSource();
        this.setGridDataSource();
    }

    private getRowHeight(): number {
        const DEFAULT_ROW_HEIGHT = 28;

        return this.gridApi
            ? ApiWrapper.getRowHeight(this.gridApi)
            : DEFAULT_ROW_HEIGHT;
    }

    private updateDesiredHeight(rowCount: number, aggregationCount: number): void {
        if (!this.gridApi) {
            return;
        }
        const { maxHeight } = this.props.config;
        if (!maxHeight) {
            return;
        }
        const rowHeight = this.getRowHeight();
        const headerHeight = ApiWrapper.getHeaderHeight(this.gridApi);
        const leeway = 1; // add small room for error to avoid scrollbars that scroll one, two pixels
        const bodyHeight = rowCount * rowHeight + leeway;
        const footerHeight = aggregationCount * rowHeight;

        // detect horizontal scroll bar and accommodate for it
        const actualWidth = this.containerRef && this.containerRef.scrollWidth;
        const preferredWidth = this.gridApi.getPreferredWidth();
        const hasHorizontalScrollBar = actualWidth < preferredWidth;
        const scrollBarPadding = hasHorizontalScrollBar ? getScrollbarWidth() : 0;

        const totalHeight = headerHeight + bodyHeight + footerHeight + scrollBarPadding;

        this.setState({
            desiredHeight: Math.min(totalHeight, maxHeight)
        });
    }

    private forceRerender() {
        this.setState(state => ({
            agGridRerenderNumber: state.agGridRerenderNumber + 1
        }));
    }
}

export const PivotTable = visualizationLoadingHOC(PivotTableInner, false);
