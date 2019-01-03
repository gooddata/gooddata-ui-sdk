// (C) 2007-2018 GoodData Corporation
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

import InjectedIntl = ReactIntl.InjectedIntl;
import InjectedIntlProps = ReactIntl.InjectedIntlProps;

import '../../../styles/scss/pivotTable.scss';

import { VisualizationTypes } from '../../constants/visualizationTypes';
import {
    assortDimensionHeaders,
    COLUMN_ATTRIBUTE_COLUMN,
    executionToAGGridAdapter,
    FIELD_SEPARATOR,
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
import { IDataSource } from '../../interfaces/DataSource';

import { IDrillEvent, IDrillEventIntersectionElement } from '../../interfaces/DrillEvents';
import { IHeaderPredicate } from '../../interfaces/HeaderPredicate';
import { IMappingHeader, isMappingHeaderAttributeItem } from '../../interfaces/MappingHeader';
import { IPivotTableConfig } from '../../interfaces/Table';
import { IDataSourceProviderInjectedProps } from '../afm/DataSourceProvider';
import { LoadingComponent } from '../simple/LoadingComponent';
import { AVAILABLE_TOTALS } from '../visualizations/table/totals/utils';

import { getMasterMeasureObjQualifier } from '../../helpers/afmHelper';

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

export interface IPivotTableProps extends ICommonChartProps {
    resultSpec?: AFM.IResultSpec;
    dataSource: IDataSource;
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    getPage?: IGetPage;
    cancelPagePromises?: () => void;
    pageSize?: number;
    config?: IPivotTableConfig;
}

export interface IPivotTableState {
    columnDefs: ColDef[];
    // rowData an an array of different objects depending on the content of the table.
    rowData: IGridRow[];
    execution: Execution.IExecutionResponses;
}

export interface ICustomGridOptions extends GridOptions {
    enableMenu?: boolean;
}

const AG_NUMERIC_CELL_CLASSNAME = 'ag-numeric-cell';
const AG_NUMERIC_HEADER_CLASSNAME = 'ag-numeric-header';

export const getDrillRowData = (leafColumnDefs: ColDef[], rowData: {[key: string]: any}) => {
    return leafColumnDefs.reduce((drillRow, colDef: ColDef) => {
        const { type } = colDef;
        // colDef without field is a utility column (e.g. top column label)
        if (colDef.field) {
            if (type === MEASURE_COLUMN) {
                return [...drillRow, rowData[colDef.field]];
            }
            const drillItem = get<any, IMappingHeader>(rowData, ['drillItemMap', colDef.field]);
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
    const dimensions: Execution.IResultDimension[] = execution.executionResponse.dimensions;
    const { attributeHeaders, measureHeaderItems } = assortDimensionHeaders(dimensions);
    const fields = getParsedFields(colId);
    const [lastFieldType, lastFieldId] = fields[fields.length - 1];

    if (lastFieldType === 'a') {
        for (const header of attributeHeaders) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                const attributeSortItem: AFM.IAttributeSortItem = {
                    attributeSortItem: {
                        direction,
                        attributeIdentifier: header.attributeHeader.localIdentifier
                    }
                };
                return attributeSortItem;
            }
        }
        invariant(false, `could not find attribute header matching ${colId}`);
    } else if (lastFieldType === 'm') {
        const headerItem = measureHeaderItems[parseInt(lastFieldId, 10)];
        const attributeLocators = fields.slice(0, -1).map((field: string[]) => {
            // first item is type which should be always 'a'
            const [, fieldId, fieldValueId] = field;
            const attributeHeaderMatch = attributeHeaders.find((attributeHeader: Execution.IAttributeHeader) => {
                return getIdsFromUri(attributeHeader.attributeHeader.formOf.uri)[0] === fieldId;
            });
            invariant(
                attributeHeaderMatch,
                `Could not find matching attribute header to field ${field.join(ID_SEPARATOR)}`
            );
            const attributeLocatorItem: AFM.IAttributeLocatorItem = {
                attributeLocatorItem: {
                    attributeIdentifier: attributeHeaderMatch.attributeHeader.localIdentifier,
                    element: `${attributeHeaderMatch.attributeHeader.formOf.uri}/elements?id=${fieldValueId}`
                }
            };
            return attributeLocatorItem;
        });
        const measureSortItem: AFM.IMeasureSortItem = {
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
        return measureSortItem;
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
) => {
    return sortModel.map((sortModelItem: ISortModelItem) => {
        const { colId, sort } = sortModelItem;
        const sortHeader = getSortItemByColId(execution, colId, sort);
        invariant(sortHeader, `unable to find sort item by field ${colId}`);
        return sortHeader;
    });
};

export const getGridDataSource = (
    resultSpec: AFM.IResultSpec,
    getPage: IGetPage,
    cancelPagePromises: () => void,
    getExecution: () => Execution.IExecutionResponses,
    onSuccess: (execution: Execution.IExecutionResponses, columnDefs: IGridHeader[]) => void,
    getGridApi: () => any,
    intl: InjectedIntl,
    columnDefOptions: IColumnDefOptions = {}
): IDatasource => ({
    getRows: ({ startRow, endRow, successCallback, sortModel }: IGetRowsParams) => {
        const execution = getExecution();
        // If execution is null, this means this is a fresh dataSource and we should ignore current sortModel
        const resultSpecWithSorting = (sortModel.length > 0 && execution)
            ? {
                ...resultSpec,
                // override sorting based on sortModel
                sorts: getSortsFromModel(sortModel, execution)
            }
            : resultSpec;

        const pagePromise = getPage(
            resultSpecWithSorting,
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
                    const { columnDefs, rowData, rowTotals } = executionToAGGridAdapter(
                        execution,
                        resultSpecWithSorting,
                        intl,
                        {
                            addLoadingRenderer: 'loadingRenderer',
                            columnDefOptions
                        }
                    );
                    const { offset, count, total } = execution.executionResult.paging;
                    // RAIL-1130: Backend returns incorrectly total: [1, N], when count: [0, N] and offset: [0, N]
                    const lastRow = offset[0] === 0 && count[0] === 0 ? 0 : total[0];
                    onSuccess(execution, columnDefs);
                    successCallback(rowData, lastRow);
                    // set totals
                    getGridApi().setPinnedBottomRowData(rowTotals);

                    return execution;
                }
            );
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
        // 0..1 measure
        // 0..1 row attribute and row attribute value
        // 0..n column attribute and column attribute values
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

        return {
            // Properties default to empty strings to maintain compatibility
            id,
            title: getMappingHeaderName(drillItem),
            header: {
                uri,
                identifier
            }
        };
    });
};

export class PivotTableInner extends
        BaseVisualization<
            IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps & InjectedIntlProps,
            IPivotTableState
        > {
    public static defaultProps: Partial<IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps> = {
        ...commonDefaultProps,
        onDataTooLarge: noop,
        pageSize: 100
    };

    private gridDataSource: IDatasource;
    private gridApi: GridApi;

    constructor(props: IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps) {
        super(props);
        this.state = {
            columnDefs: [],
            rowData: [],
            execution: null
        };
        this.gridDataSource = null;
        this.gridApi = null;
    }

    public componentWillMount() {
        const { resultSpec, getPage, cancelPagePromises } = this.props;
        this.createDataSource(resultSpec, getPage, cancelPagePromises);
    }

    public componentWillReceiveProps(
        nextProps: IPivotTableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps
    ) {
        const propsRequiringNewDataSource = [
            'resultSpec',
            'getPage',
            'dataSource',
            // drillable items need fresh execution because drillable context for row attribute is kept in rowData
            // It could be refactored to assign drillability without execution,
            // but it would suffer a significant performance hit
            'drillableItems'
        ];

        if (propsRequiringNewDataSource.some(propKey => !isEqual(this.props[propKey], nextProps[propKey]))) {
            this.createDataSource(nextProps.resultSpec, nextProps.getPage, nextProps.cancelPagePromises);
            this.setGridDataSource();
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
                get<CellClassParams, IMappingHeader>(cellClassParams, ['data', 'drillItemMap', colDef.field]);
            const headers: IMappingHeader[] = rowDrillItem ? [...colDef.drillItems, rowDrillItem] : colDef.drillItems;

            hasDrillableHeader = headers.some((drillItem: IMappingHeader) =>
                isSomeHeaderPredicateMatched(drillablePredicates, drillItem, afm, executionResponse));
        }

        const className = classNames(
            classList,
            getCellClassNames(rowIndex, colDef.index, hasDrillableHeader),
            colDef.index !== undefined ? `gd-column-index-${colDef.index}` : null,
            colDef.measureIndex !== undefined ? `gd-column-measure-${colDef.measureIndex}` : null,
            isRowTotal ? 'gd-row-total' : null
        );
        return className;
    }

    public getHeaderClass = (classList: string) => (headerClassParams: any): string => {
        const colDef: ColDef = headerClassParams.colDef;
        const { field } = colDef;
        const treeIndexes = colDef ? indexOfTreeNode(
            colDef,
            this.state.columnDefs,
            (nodeA, nodeB) => nodeA.field !== undefined && nodeA.field === nodeB.field
        ) : null;
        const colGroupIndex = treeIndexes
            ? treeIndexes[treeIndexes.length - 1]
            : null;
        const isFirstColumn = treeIndexes !== null && !treeIndexes.some(index => index !== 0);
        const className = classNames(
            classList,
            'gd-column-group-header',
            colGroupIndex !== null ? `gd-column-group-header-${colGroupIndex}` : null,
            !field ? 'gd-column-group-header--empty' : null,
            isFirstColumn ? 'gd-column-group-header--first' : null
        );
        return className;
    }

    public getExecution = () => {
        return this.state.execution;
    }

    public createDataSource(resultSpec: AFM.IResultSpec, getPage: IGetPage, cancelPagePromises: () => void) {
        const onSuccess = (execution: Execution.IExecutionResponses, columnDefs: IGridHeader[]) => {
            if (!isEqual(columnDefs, this.state.columnDefs)) {
                this.setState({
                    columnDefs
                });
            }
            if (!isEqual(execution, this.state.execution)) {
                this.setState({
                    execution
                });
            }
        };
        this.gridDataSource = getGridDataSource(
            resultSpec,
            getPage,
            cancelPagePromises,
            this.getExecution,
            onSuccess,
            this.getGridApi,
            this.props.intl,
            {}
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
            this.gridApi.setDatasource(this.gridDataSource);
        }
    }

    public cellClicked = (cellEvent: IGridCellEvent) => {
        const { onFiredDrillEvent, execution: { executionResponse } } = this.props;
        const { columnDefs } = this.state;
        const afm: AFM.IAfm = this.props.dataSource.getAfm();
        const drillablePredicates = this.getDrillablePredicates();

        const { colDef, rowIndex } = cellEvent;
        const isRowTotal = get<IGridCellEvent, string>(cellEvent, ['data', 'type', ROW_TOTAL]);
        const rowDrillItem = get<IGridCellEvent, IMappingHeader>(cellEvent, ['data', 'drillItemMap', colDef.field]);
        const drillItems: IMappingHeader[] = rowDrillItem ? [...colDef.drillItems, rowDrillItem] : colDef.drillItems;
        const drillableHeaders = drillItems.filter((drillItem: IMappingHeader) =>
            isSomeHeaderPredicateMatched(drillablePredicates, drillItem, afm, executionResponse));

        if (isRowTotal || drillableHeaders.length === 0) {
            return false;
        }

        const leafColumnDefs = getTreeLeaves(columnDefs);
        const drillEvent: IDrillEvent = {
            executionContext: afm,
            drillContext: {
                type: VisualizationTypes.TABLE,
                element: 'cell',
                columnIndex: leafColumnDefs.findIndex(gridHeader => gridHeader.field === colDef.field),
                rowIndex,
                row: getDrillRowData(leafColumnDefs, cellEvent.data),
                intersection: getDrillIntersection(drillItems, afm),
                value: cellEvent.value ? cellEvent.value.toString() : null
            }
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

    public sortChanged = (event: SortChangedEvent): void => {
        const execution = this.getExecution();

        invariant(execution !== undefined, 'changing sorts without prior execution cannot work');

        const sortModel: ISortModelItem[] = event.columnApi.getAllColumns()
            .filter(col => col.getSort() !== undefined && col.getSort() !== null)
            .map(col => ({ colId: col.getColId(), sort: col.getSort() as AFM.SortDirection }));

        const sortItems = getSortsFromModel(sortModel, this.getExecution());

        this.props.pushData({
            properties: {
                sortItems
            }
        });
    }

    public renderVisualization() {
        const { columnDefs, rowData } = this.state;
        const { pageSize } = this.props;

        const separators = get(this.props, 'config.separators', undefined);

        const gridOptions: ICustomGridOptions = {
            // Initial data
            columnDefs,
            rowData,

            defaultColDef: {
                cellClass: this.getCellClass(null),
                headerComponentFramework: ColumnHeader as any,
                headerComponentParams: {
                    enableMenu: false
                }
            },
            defaultColGroupDef: {
                headerClass: this.getHeaderClass(null),
                children: [],
                headerGroupComponentFramework: ColumnGroupHeader as any,
                headerGroupComponentParams: {
                    enableMenu: false
                }
            },
            onCellClicked: this.cellClicked,
            onSortChanged: this.sortChanged,

            // Basic options
            suppressMovableColumns: true,
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
            getRowNodeId: (item) => {
                return Object.keys(item.drillItemMap).map((key) => {
                    const drillItem: IMappingHeader = item.drillItemMap[key];
                    const ids = getIdsFromUri(getMappingHeaderUri(drillItem));
                    return `${key}${ID_SEPARATOR}${ids[1]}`;
                }).join(FIELD_SEPARATOR);
            },

            // Column types
            columnTypes: {
                [ROW_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass('gd-row-attribute-column'),
                    headerClass: this.getHeaderClass('gd-row-attribute-column-header'),
                    colSpan: (params: any) => {
                        if (
                            // params.data is undefined when rows are in loading state
                            params.data &&
                            params.data.colSpan &&
                            AVAILABLE_TOTALS.find(item => item === params.data[params.data.colSpan.headerKey])
                        ) {
                            return params.data.colSpan.count;
                        }
                        return 1;
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
                        AG_NUMERIC_HEADER_CLASSNAME, 'gd-measure-column-header')),
                    valueFormatter: (params: any) => {
                        return params.value === undefined
                            ? null
                            : getMeasureCellFormattedValue(
                                params.value,
                                this.getMeasureFormat(params),
                                separators
                            );
                    },
                    cellStyle: (params: any) => {
                        return params.value === undefined
                            ? null
                            : getMeasureCellStyle(
                                params.value,
                                this.getMeasureFormat(params),
                                separators,
                                true
                            );
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
                style={{ height: '100%', position: 'relative' }}
            >
                {tableLoadingOverlay}
                <AgGridReact
                    {...gridOptions}
                />
            </div>
        );
    }

    private getDrillablePredicates(): IHeaderPredicate[] {
        return convertDrillableItemsToPredicates(this.props.drillableItems);
    }

    private getMeasureFormat(params: any): string {
        const headers = this.state.execution.executionResponse.dimensions[1].headers;
        const header = headers[headers.length - 1];

        if (Execution.isMeasureGroupHeader(header)) {
            const measureIndex = params.colDef.measureIndex;
            return header.measureGroupHeader.items[measureIndex].measureHeaderItem.format;
        }

        throw new Error(`Cannot get measure format from header ${Object.keys(header)}`);
    }
}

export const PivotTable = visualizationLoadingHOC(PivotTableInner, false);
