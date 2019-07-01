// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as classNames from "classnames";
import { injectIntl } from "react-intl";
import debounce = require("lodash/debounce");
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import pick = require("lodash/pick");
import uniqueId = require("lodash/uniqueId");
import { Cell, CellProps, Column, Table, ColumnHeaderProps } from "fixed-data-table-2";
import { AFM, Execution } from "@gooddata/typings";
import { ISeparators } from "@gooddata/numberjs";
import "nodelist-foreach-polyfill";

import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import { Subscription } from "rxjs/Subscription";
import { isSomeHeaderPredicateMatched } from "../../../helpers/headerPredicate";
import { getMappingHeaderLocalIdentifier, getMappingHeaderName } from "../../../helpers/mappingHeader";
import { IMappingHeader, isMappingHeaderMeasureItem } from "../../../interfaces/MappingHeader";

import { IHeaderPredicate } from "../../../interfaces/HeaderPredicate";
import { OnFiredDrillEvent } from "../../../interfaces/Events";
import {
    Align,
    IAlignPoint,
    IPositions,
    IScrollEvent,
    ISortObj,
    OnSortChangeWithItem,
    SortDir,
    TableCell,
    TableRow,
} from "../../../interfaces/Table";
import { TableSortBubbleContent } from "./TableSortBubbleContent";
import { getColumnAlign } from "./utils/column";
import { subscribeEvents } from "../utils/common";
import { getCellClassNames, getCellStyleAndFormattedValue } from "../../../helpers/tableCell";
import { getIntersectionForDrilling, getBackwardCompatibleRowForDrilling } from "./utils/dataTransformation";
import { cellClick } from "../utils/drilldownEventing";
import { createSortItem, getHeaderSortClassName, getNextSortDir } from "./utils/sort";
import { updatePosition } from "./utils/row";
import {
    calculateArrowPosition,
    getFooterHeight,
    getFooterPositions,
    getHeaderClassNames,
    getHeaderPositions,
    getTooltipAlignPoints,
    getTooltipSortAlignPoints,
    isFooterAtDefaultPosition,
    isFooterAtEdgePosition,
    isHeaderAtDefaultPosition,
    isHeaderAtEdgePosition,
} from "./utils/layout";
import { RemoveRows } from "./totals/RemoveRows";
import {
    toggleCellClass,
    resetRowClass,
    removeTotalsRow,
    addTotalsRow,
    updateTotalsRemovePosition,
    addMeasureIndex,
    removeMeasureIndex,
    getFirstMeasureIndex,
    getTotalsDefinition,
    shouldShowTotals,
} from "./totals/utils";
import { TotalCell } from "./totals/TotalCell";
import InjectedIntlProps = ReactIntl.InjectedIntlProps;
import { IIndexedTotalItem, ITotalWithData } from "../../../interfaces/Totals";
import { IDrillConfig } from "../../../interfaces/DrillEvents";
import { DEFAULT_HEADER_HEIGHT, DEFAULT_ROW_HEIGHT } from "./constants/layout";

const FULLSCREEN_TOOLTIP_VIEWPORT_THRESHOLD: number = 480;
const MIN_COLUMN_WIDTH: number = 100;

const DEBOUNCE_SCROLL_STOP: number = 500;
const TOOLTIP_DISPLAY_DELAY: number = 1000;

export const SCROLL_DEBOUNCE: number = 0;
export const RESIZE_DEBOUNCE: number = 60;

const scrollEvents: IScrollEvent[] = [
    {
        name: "scroll",
        debounce: SCROLL_DEBOUNCE,
    },
    {
        name: "goodstrap.scrolled",
        debounce: SCROLL_DEBOUNCE,
    },
    {
        name: "resize",
        debounce: RESIZE_DEBOUNCE,
    },
    {
        name: "goodstrap.drag",
        debounce: RESIZE_DEBOUNCE,
    },
];

/**
 * We have to extend the FixedDataTable interface as
 * the FixedDataTable's inteface is not defined with state
 * which we are dependent on.
 *
 * TODO: Remove dependency on FixedDataTable internal state
 */
export interface IFixedDataTableWithState extends Table {
    state: {
        scrollX: number;
    };
}

export interface IContainerProps {
    containerHeight?: number;
    containerWidth: number;
}

export interface ITableVisualizationProps {
    containerMaxHeight?: number;
    afterRender?: () => void;
    drillablePredicates?: IHeaderPredicate[];
    executionRequest: AFM.IExecution;
    executionResponse: Execution.IExecutionResponse;
    headers?: IMappingHeader[];
    hasHiddenRows?: boolean;
    rows?: TableRow[];
    onFiredDrillEvent?: OnFiredDrillEvent;
    onSortChange?: OnSortChangeWithItem;
    sortBy?: number;
    sortDir?: SortDir;
    sortInTooltip?: boolean;
    stickyHeaderOffset?: number;
    totalsEditAllowed?: boolean;
    onTotalsEdit?: (indexedTotals: IIndexedTotalItem[]) => void;
    totalsWithData?: ITotalWithData[];
    lastAddedTotalType?: AFM.TotalType;
    onLastAddedTotalRowHighlightPeriodEnd?: () => void;
    separators?: ISeparators;
}

export interface ITableVisualizationState {
    hintSortBy: number;
    sortBubble: {
        index?: number;
        visible: boolean;
    };
    width: number;
    height: number;
}

export class TableVisualizationClass extends React.Component<
    ITableVisualizationProps & InjectedIntlProps & IContainerProps,
    ITableVisualizationState
> {
    public static defaultProps: Partial<ITableVisualizationProps & IContainerProps> = {
        afterRender: noop,
        containerHeight: null,
        containerMaxHeight: null,
        drillablePredicates: [],
        hasHiddenRows: false,
        headers: [],
        onFiredDrillEvent: () => true,
        onSortChange: noop,
        rows: [],
        sortBy: null,
        sortDir: null,
        sortInTooltip: false,
        stickyHeaderOffset: -1,
        totalsEditAllowed: false,
        onTotalsEdit: noop,
        totalsWithData: [],
        lastAddedTotalType: null,
        onLastAddedTotalRowHighlightPeriodEnd: noop,
    };

    private static fullscreenTooltipEnabled(): boolean {
        return document.documentElement.clientWidth <= FULLSCREEN_TOOLTIP_VIEWPORT_THRESHOLD;
    }

    private static isSticky(stickyHeaderOffset: number): boolean {
        return stickyHeaderOffset >= 0;
    }

    private static getTableHeight(height: number, maxHeight: number): number {
        if (!maxHeight) {
            return height;
        }

        return height < maxHeight ? height : maxHeight;
    }

    private addTotalDropdownOpened: boolean;
    private footer: HTMLElement;
    private header: HTMLElement;
    private rootRef: Element;
    private scrollingStopped: () => void;
    private subscribers: Subscription[];
    private table: HTMLElement;
    private tableComponentRef: IFixedDataTableWithState;
    private tableInnerContainer: Element;
    private tableWrapRef: Element;
    private totalsRemoveComponentRef: RemoveRows;

    constructor(props: ITableVisualizationProps & InjectedIntlProps & IContainerProps) {
        super(props);

        this.state = {
            hintSortBy: null,
            sortBubble: {
                visible: false,
            },
            width: 0,
            height: 0,
        };

        this.setRootRef = this.setRootRef.bind(this);
        this.setTableWrapRef = this.setTableWrapRef.bind(this);
        this.setTableComponentRef = this.setTableComponentRef.bind(this);
        this.closeSortBubble = this.closeSortBubble.bind(this);
        this.renderDefaultHeader = this.renderDefaultHeader.bind(this);
        this.renderTooltipHeader = this.renderTooltipHeader.bind(this);
        this.scroll = this.scroll.bind(this);
        this.scrolled = this.scrolled.bind(this);
        this.addTotalsRow = this.addTotalsRow.bind(this);
        this.setTotalsRemoveComponentRef = this.setTotalsRemoveComponentRef.bind(this);
        this.removeTotalsRow = this.removeTotalsRow.bind(this);
        this.toggleColumnHighlight = this.toggleColumnHighlight.bind(this);
        this.toggleBodyColumnHighlight = this.toggleBodyColumnHighlight.bind(this);
        this.toggleFooterColumnHighlight = this.toggleFooterColumnHighlight.bind(this);
        this.resetTotalsRowHighlight = this.resetTotalsRowHighlight.bind(this);
        this.enableTotalColumn = this.enableTotalColumn.bind(this);
        this.disableTotalColumn = this.disableTotalColumn.bind(this);

        this.scrollingStopped = debounce(() => this.scroll(true), DEBOUNCE_SCROLL_STOP);

        this.addTotalDropdownOpened = false;
    }

    public componentDidMount(): void {
        this.table = ReactDOM.findDOMNode(this.tableComponentRef) as HTMLElement;
        this.tableInnerContainer = this.table.querySelector(".fixedDataTableLayout_rowsContainer");
        const tableRows = this.table.querySelectorAll(".fixedDataTableRowLayout_rowWrapper") as NodeListOf<
            HTMLElement
        >;

        this.header = tableRows[0];
        this.header.classList.add("table-header");

        if (this.hasFooterWithTotals()) {
            this.footer = tableRows[tableRows.length - 1];
            this.footer.classList.add("table-footer");
        }

        if (TableVisualizationClass.isSticky(this.props.stickyHeaderOffset)) {
            this.setListeners();
            this.scrolled();
            this.checkTableDimensions();
        }
    }

    public componentWillReceiveProps(nextProps: ITableVisualizationProps): void {
        const current: ITableVisualizationProps = this.props;
        const currentIsSticky: boolean = TableVisualizationClass.isSticky(current.stickyHeaderOffset);
        const nextIsSticky: boolean = TableVisualizationClass.isSticky(nextProps.stickyHeaderOffset);

        if (currentIsSticky !== nextIsSticky) {
            if (currentIsSticky) {
                this.unsetListeners();
            }
            if (nextIsSticky) {
                this.setListeners();
            }
        }
    }

    public componentDidUpdate(prevProps: ITableVisualizationProps): void {
        if (!isEqual(prevProps.totalsWithData, this.props.totalsWithData)) {
            const tableRows = this.table.querySelectorAll(
                ".fixedDataTableRowLayout_rowWrapper",
            ) as NodeListOf<HTMLElement>;

            if (this.footer) {
                this.footer.classList.remove("table-footer");
            }

            if (this.hasFooterWithTotals()) {
                this.footer = tableRows[tableRows.length - 1];
                this.footer.classList.add("table-footer");
            }
        }

        if (TableVisualizationClass.isSticky(this.props.stickyHeaderOffset)) {
            this.scroll(true);
            this.checkTableDimensions();
        }

        this.props.afterRender();
    }

    public componentWillUnmount(): void {
        this.unsetListeners();
    }

    public render(): JSX.Element {
        const {
            totalsWithData,
            containerHeight,
            containerMaxHeight,
            containerWidth,
            headers,
            stickyHeaderOffset,
        } = this.props;

        const height = TableVisualizationClass.getTableHeight(containerHeight, containerMaxHeight);
        const footerHeight = getFooterHeight(
            totalsWithData,
            this.isTotalsEditAllowed(),
            shouldShowTotals(headers),
        );
        const columnWidth: number = Math.max(containerWidth / headers.length, MIN_COLUMN_WIDTH);
        const isSticky: boolean = TableVisualizationClass.isSticky(stickyHeaderOffset);

        return (
            <div ref={this.setRootRef}>
                <div className={this.getComponentClasses()}>
                    <div className={this.getContentClasses()} ref={this.setTableWrapRef}>
                        <Table
                            ref={this.setTableComponentRef}
                            touchScrollEnabled={true}
                            headerHeight={DEFAULT_HEADER_HEIGHT}
                            footerHeight={footerHeight}
                            rowHeight={DEFAULT_ROW_HEIGHT}
                            rowsCount={this.props.rows.length}
                            width={containerWidth}
                            maxHeight={height}
                            onScrollStart={this.closeSortBubble}
                        >
                            {this.renderColumns(headers, columnWidth)}
                        </Table>
                    </div>
                    {isSticky ? this.renderStickyTableBackgroundFiller() : false}
                </div>
                {this.renderTotalsRemove()}
            </div>
        );
    }

    private onTotalsEdit(totalsWithData: ITotalWithData[]): void {
        const totalsDefinition: IIndexedTotalItem[] = getTotalsDefinition(totalsWithData);

        this.props.onTotalsEdit(totalsDefinition);
    }

    private setRootRef(ref: Element): void {
        this.rootRef = ref;
    }

    private setTableComponentRef(ref: IFixedDataTableWithState): void {
        this.tableComponentRef = ref;
    }

    private setTableWrapRef(ref: Element): void {
        this.tableWrapRef = ref;
    }

    private setTotalsRemoveComponentRef(ref: RemoveRows): void {
        this.totalsRemoveComponentRef = ref;
    }

    private setListeners(): void {
        this.subscribers = subscribeEvents(this.scrolled, scrollEvents);
    }

    private getSortFunc(header: IMappingHeader, sort: ISortObj): () => void {
        const { onSortChange } = this.props;
        const sortItem = createSortItem(header, sort);

        return () => onSortChange(sortItem);
    }

    private getSortObj(header: IMappingHeader, index: number): ISortObj {
        const { sortBy, sortDir } = this.props;
        const { hintSortBy } = this.state;

        const dir: SortDir = sortBy === index ? sortDir : null;
        const nextDir: SortDir = getNextSortDir(header, dir);

        return {
            dir,
            nextDir,
            sortDirClass: getHeaderSortClassName(hintSortBy === index ? nextDir : dir, dir),
        };
    }

    private getMouseOverFunc(index: number): () => void {
        return () => {
            // workaround glitch with fixed-data-table-2,
            // where header styles are overwritten first time user mouses over it
            this.scrolled();

            this.setState({ hintSortBy: index });
        };
    }

    private getComponentClasses(): string {
        const { hasHiddenRows } = this.props;

        return classNames("indigo-table-component", {
            "has-hidden-rows": hasHiddenRows,
            "has-footer": this.hasFooterWithTotals(),
            "has-footer-editable": this.isTotalsEditAllowed(),
        });
    }

    private getContentClasses(): string {
        const { stickyHeaderOffset } = this.props;

        return classNames("indigo-table-component-content", {
            "has-sticky-header": TableVisualizationClass.isSticky(stickyHeaderOffset),
        });
    }

    private unsetListeners(): void {
        if (this.subscribers && this.subscribers.length > 0) {
            this.subscribers.forEach((subscriber: Subscription) => {
                subscriber.unsubscribe();
            });
            this.subscribers = null;
        }
    }

    private toggleBodyColumnHighlight(columnIndex: number, isHighlighted: boolean): void {
        if (this.addTotalDropdownOpened) {
            return;
        }
        toggleCellClass(this.table, columnIndex, isHighlighted, "indigo-table-cell-highlight");
    }

    private toggleFooterColumnHighlight(columnIndex: number, isHighlighted: boolean): void {
        if (this.addTotalDropdownOpened) {
            return;
        }
        toggleCellClass(this.footer, columnIndex, isHighlighted, "indigo-table-footer-cell-highlight");
    }

    private toggleColumnHighlight(columnIndex: number, isHighlighted: boolean): void {
        this.toggleBodyColumnHighlight(columnIndex, isHighlighted);
        this.toggleFooterColumnHighlight(columnIndex, isHighlighted);
    }

    private resetTotalsRowHighlight(rowIndex: number): void {
        if (!this.isTotalsEditAllowed()) {
            return;
        }
        resetRowClass(
            this.rootRef,
            "indigo-totals-remove-row-highlight",
            ".indigo-totals-remove > .indigo-totals-remove-row",
            rowIndex,
        );
    }

    private hasFooterWithTotals(): boolean {
        const { headers, totalsWithData } = this.props;

        return this.isTotalsEditAllowed() || (totalsWithData.length && shouldShowTotals(headers));
    }

    private checkTableDimensions(): void {
        if (this.table) {
            const { width, height } = this.state;
            const rect: ClientRect = this.table.getBoundingClientRect();

            if (width !== rect.width || height !== rect.height) {
                this.setState(pick<ClientRect, "width" | "height">(rect, "width", "height"));
            }
        }
    }

    private scrollHeader(isScrollingStopped: boolean = false): void {
        const { stickyHeaderOffset, sortInTooltip, totalsWithData, hasHiddenRows, headers } = this.props;
        const tableBoundingRect = this.tableInnerContainer.getBoundingClientRect();
        const totalsEditAllowed = this.isTotalsEditAllowed();
        const totalsAreVisible: boolean = shouldShowTotals(headers);
        const isOutOfViewport: boolean = tableBoundingRect.bottom < 0;

        if (isOutOfViewport) {
            return;
        }

        if (!isScrollingStopped && sortInTooltip && this.state.sortBubble.visible) {
            this.closeSortBubble();
        }

        const isDefaultPosition: boolean = isHeaderAtDefaultPosition(
            stickyHeaderOffset,
            tableBoundingRect.top,
        );

        const isEdgePosition: boolean = isHeaderAtEdgePosition(
            stickyHeaderOffset,
            hasHiddenRows,
            totalsWithData,
            tableBoundingRect.bottom,
            totalsEditAllowed,
            totalsAreVisible,
        );

        const positions: IPositions = getHeaderPositions(
            stickyHeaderOffset,
            hasHiddenRows,
            totalsWithData,
            totalsEditAllowed,
            totalsAreVisible,
            {
                height: tableBoundingRect.height,
                top: tableBoundingRect.top,
            },
        );

        updatePosition(this.header, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);
    }

    private scrollFooter(isScrollingStopped: boolean = false): void {
        const { hasHiddenRows, totalsWithData, headers } = this.props;
        const tableBoundingRect: ClientRect = this.tableInnerContainer.getBoundingClientRect();
        const totalsEditAllowed: boolean = this.isTotalsEditAllowed();
        const totalsAreVisible: boolean = shouldShowTotals(headers);
        const isOutOfViewport: boolean = tableBoundingRect.top > window.innerHeight;

        if (isOutOfViewport || !this.hasFooterWithTotals()) {
            return;
        }

        const isDefaultPosition: boolean = isFooterAtDefaultPosition(
            hasHiddenRows,
            tableBoundingRect.bottom,
            window.innerHeight,
        );

        const isEdgePosition: boolean = isFooterAtEdgePosition(
            hasHiddenRows,
            totalsWithData,
            window.innerHeight,
            totalsEditAllowed,
            totalsAreVisible,
            {
                height: tableBoundingRect.height,
                bottom: tableBoundingRect.bottom,
            },
        );

        const positions: IPositions = getFooterPositions(
            hasHiddenRows,
            totalsWithData,
            window.innerHeight,
            totalsEditAllowed,
            totalsAreVisible,
            {
                height: tableBoundingRect.height,
                bottom: tableBoundingRect.bottom,
            },
        );

        updatePosition(this.footer, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);

        if (this.totalsRemoveComponentRef) {
            const wrapperRef = this.totalsRemoveComponentRef.getWrapperRef();
            updateTotalsRemovePosition(
                tableBoundingRect,
                totalsWithData,
                totalsAreVisible,
                totalsEditAllowed,
                wrapperRef,
            );
        }
    }

    private scroll(isScrollingStopped: boolean = false): void {
        this.scrollHeader(isScrollingStopped);
        this.scrollFooter(isScrollingStopped);
    }

    private scrolled(): void {
        this.scroll();
        this.scrollingStopped();
    }

    private closeSortBubble(): void {
        this.setState({
            sortBubble: {
                visible: false,
            },
        });
    }

    private isBubbleVisible(index: number): boolean {
        const { sortBubble } = this.state;
        return sortBubble.visible && sortBubble.index === index;
    }

    private isTotalsEditAllowed(): boolean {
        const { headers, totalsEditAllowed } = this.props;

        return totalsEditAllowed && shouldShowTotals(headers);
    }

    private addTotalsRow(columnIndex: number, totalType: AFM.TotalType): void {
        const { totalsWithData, headers } = this.props;
        const totalsAddedRow = addTotalsRow(totalsWithData, totalType);
        const totalsEnabledColumn = addMeasureIndex(totalsAddedRow, headers, totalType, columnIndex);

        if (!isEqual(totalsEnabledColumn, totalsWithData)) {
            this.onTotalsEdit(totalsEnabledColumn);
        }
    }

    private removeTotalsRow(totalType: AFM.TotalType): void {
        const updatedTotals = removeTotalsRow(this.props.totalsWithData, totalType);

        this.onTotalsEdit(updatedTotals);
    }

    private enableTotalColumn(columnIndex: number, totalType: AFM.TotalType): void {
        const updatedTotals = addMeasureIndex(
            this.props.totalsWithData,
            this.props.headers,
            totalType,
            columnIndex,
        );

        this.onTotalsEdit(updatedTotals);
    }

    private disableTotalColumn(columnIndex: number, totalType: AFM.TotalType): void {
        const updatedTotals = removeMeasureIndex(
            this.props.totalsWithData,
            this.props.headers,
            totalType,
            columnIndex,
        );

        this.onTotalsEdit(updatedTotals);
    }

    private renderTooltipHeader(header: IMappingHeader, columnIndex: number, columnWidth: number) {
        const headerClasses: string = getHeaderClassNames(header);
        const headerName = getMappingHeaderName(header);
        const bubbleClass: string = uniqueId("table-header-");
        const cellClasses: string = classNames(headerClasses, bubbleClass);
        const sort: ISortObj = this.getSortObj(header, columnIndex);
        const columnAlign: Align = getColumnAlign(header);
        const sortingModalAlignPoints: IAlignPoint[] = getTooltipSortAlignPoints(columnAlign);

        const getArrowPositions: () => { left: string } = () => {
            return TableVisualizationClass.fullscreenTooltipEnabled()
                ? calculateArrowPosition(
                      {
                          width: columnWidth,
                          align: columnAlign,
                          index: columnIndex,
                      },
                      this.tableComponentRef.state.scrollX,
                      this.tableWrapRef,
                  )
                : null;
        };

        const showSortBubble: () => void = () => {
            // workaround glitch with fixed-data-table-2
            // where header styles are overwritten first time user clicks on it
            this.scroll();

            this.setState({
                sortBubble: {
                    visible: true,
                    index: columnIndex,
                },
            });
        };

        return (props: ColumnHeaderProps) => (
            <span>
                <Cell {...props} className={cellClasses} onClick={showSortBubble}>
                    <span className="gd-table-header-title">{headerName}</span>
                    <span className={sort.sortDirClass} />
                </Cell>
                {this.isBubbleVisible(columnIndex) && (
                    <Bubble
                        closeOnOutsideClick={true}
                        alignTo={`.${bubbleClass}`}
                        className="gd-table-header-bubble bubble-light"
                        overlayClassName="gd-table-header-bubble-overlay"
                        alignPoints={sortingModalAlignPoints}
                        arrowDirections={{
                            "bl tr": "top",
                            "br tl": "top",
                            "tl br": "bottom",
                            "tr bl": "bottom",
                        }}
                        arrowOffsets={{
                            "bl tr": [14, 10],
                            "br tl": [-14, 10],
                            "tl br": [14, -10],
                            "tr bl": [-14, -10],
                        }}
                        arrowStyle={getArrowPositions}
                        onClose={this.closeSortBubble}
                    >
                        <TableSortBubbleContent
                            activeSortDir={sort.dir}
                            title={headerName}
                            onClose={this.closeSortBubble}
                            onSortChange={this.getSortFunc(header, sort)}
                        />
                    </Bubble>
                )}
            </span>
        );
    }

    private renderDefaultHeader(header: IMappingHeader, columnIndex: number) {
        const headerClasses = getHeaderClassNames(header);
        const headerName = getMappingHeaderName(header);
        const onMouseEnter = this.getMouseOverFunc(columnIndex);
        const onMouseLeave = this.getMouseOverFunc(null);
        const sort: ISortObj = this.getSortObj(header, columnIndex);
        const onClick = this.getSortFunc(header, sort);
        const columnAlign: Align = getColumnAlign(header);
        const tooltipAlignPoints: IAlignPoint[] = getTooltipAlignPoints(columnAlign);

        return (props: ColumnHeaderProps) => (
            <Cell
                {...props}
                className={headerClasses}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <BubbleHoverTrigger className="gd-table-header-title" showDelay={TOOLTIP_DISPLAY_DELAY}>
                    {headerName}
                    <Bubble
                        closeOnOutsideClick={true}
                        className="bubble-light"
                        overlayClassName="gd-table-header-bubble-overlay"
                        alignPoints={tooltipAlignPoints}
                    >
                        {headerName}
                    </Bubble>
                </BubbleHoverTrigger>
                <span className={sort.sortDirClass} />
            </Cell>
        );
    }

    private renderCell(
        headers: IMappingHeader[],
        columnIndex: number,
    ): (cellProps: CellProps) => JSX.Element {
        const {
            executionRequest,
            executionResponse,
            drillablePredicates,
            onFiredDrillEvent,
            rows,
            separators,
        } = this.props;
        const afm = executionRequest.execution.afm;
        const header: IMappingHeader = headers[columnIndex];
        const drillable = isSomeHeaderPredicateMatched(drillablePredicates, header, afm, executionResponse);

        return (cellProps: CellProps) => {
            const rowIndex: number = cellProps.rowIndex;
            const columnKey: number = cellProps.columnKey as number;
            const row: TableRow = rows[rowIndex];
            const cellContent: TableCell = row[columnKey];
            const classes: string = getCellClassNames(rowIndex, columnKey, drillable);
            const drillConfig: IDrillConfig = { afm, onFiredDrillEvent };
            const hoverable: boolean = isMappingHeaderMeasureItem(header) && this.isTotalsEditAllowed();
            const { style, formattedValue } = getCellStyleAndFormattedValue(
                header,
                cellContent,
                true,
                separators,
            );

            const cellPropsDrill: CellProps = drillable
                ? {
                      ...cellProps,
                      onClick(e: React.MouseEvent<Cell>) {
                          cellClick(
                              drillConfig,
                              {
                                  columnIndex: columnKey,
                                  rowIndex,
                                  row: getBackwardCompatibleRowForDrilling(row),
                                  intersection: [getIntersectionForDrilling(afm, header)],
                              },
                              e.target,
                          );
                      },
                  }
                : cellProps;

            const cellPropsHover: CellProps = hoverable
                ? {
                      ...cellPropsDrill,
                      onMouseOver: () => this.toggleFooterColumnHighlight(columnIndex, true),
                      onMouseLeave: () => this.toggleFooterColumnHighlight(columnIndex, false),
                  }
                : cellPropsDrill;

            return (
                <Cell {...cellPropsHover} className={classNames(`col-${columnIndex}`)}>
                    <span className={classes} style={style} title={formattedValue}>
                        {formattedValue}
                    </span>
                </Cell>
            );
        };
    }

    private renderFooter(header: IMappingHeader, columnIndex: number, headersCount: number): JSX.Element {
        const { headers, totalsWithData, separators } = this.props;

        if (!shouldShowTotals(headers)) {
            return null;
        }

        const onCellMouseOver = (rowIndex: number, colIndex: number) => {
            this.resetTotalsRowHighlight(rowIndex);
            this.toggleFooterColumnHighlight(colIndex, true);
        };

        const onCellMouseLeave = (rowIndex: number, colIndex: number) => {
            this.resetTotalsRowHighlight(rowIndex);
            this.toggleFooterColumnHighlight(colIndex, false);
        };

        const onAddDropdownOpenStateChanged = (colIndex: number, isOpened: boolean) => {
            this.addTotalDropdownOpened = isOpened;
            this.toggleBodyColumnHighlight(colIndex, isOpened);
            this.toggleFooterColumnHighlight(colIndex, isOpened);
        };

        const onAddWrapperHover = (colIndex: number, isHighlighted: boolean) => {
            this.toggleFooterColumnHighlight(colIndex, isHighlighted);
        };

        const onAddButtonHover = (colIndex: number, isHovered: boolean) => {
            this.toggleBodyColumnHighlight(colIndex, isHovered);
            this.toggleFooterColumnHighlight(colIndex, isHovered);
        };

        return (
            <TotalCell
                totalsWithData={totalsWithData}
                columnIndex={columnIndex}
                header={header}
                headersCount={headersCount}
                firstMeasureIndex={getFirstMeasureIndex(headers)}
                editAllowed={this.isTotalsEditAllowed()}
                separators={separators}
                onCellMouseOver={onCellMouseOver}
                onCellMouseLeave={onCellMouseLeave}
                onEnableColumn={this.enableTotalColumn}
                onDisableColumn={this.disableTotalColumn}
                onAddDropdownOpenStateChanged={onAddDropdownOpenStateChanged}
                onAddWrapperHover={onAddWrapperHover}
                onAddButtonHover={onAddButtonHover}
                onRowAdd={this.addTotalsRow}
            />
        );
    }

    private renderColumns(headers: IMappingHeader[], columnWidth: number): JSX.Element[] {
        const renderHeader = this.props.sortInTooltip ? this.renderTooltipHeader : this.renderDefaultHeader;

        return headers.map((header: IMappingHeader, columnIndex: number) => (
            <Column
                key={`${columnIndex}.${getMappingHeaderLocalIdentifier(header)}`}
                width={columnWidth}
                align={getColumnAlign(header)}
                columnKey={columnIndex}
                header={renderHeader(header, columnIndex, columnWidth)}
                footer={this.renderFooter(header, columnIndex, headers.length)}
                cell={this.renderCell(headers, columnIndex)}
                allowCellsRecycling={true}
            />
        ));
    }

    private renderStickyTableBackgroundFiller(): JSX.Element {
        return (
            <div
                className="indigo-table-background-filler"
                style={{ ...pick(this.state, "width", "height") }}
            />
        );
    }

    private renderTotalsRemove(): JSX.Element {
        if (!this.isTotalsEditAllowed()) {
            return null;
        }

        const { totalsWithData, lastAddedTotalType, onLastAddedTotalRowHighlightPeriodEnd } = this.props;

        return (
            <RemoveRows
                lastAddedTotalType={lastAddedTotalType}
                onLastAddedTotalRowHighlightPeriodEnd={onLastAddedTotalRowHighlightPeriodEnd}
                totalsWithData={totalsWithData}
                onRemove={this.removeTotalsRow}
                ref={this.setTotalsRemoveComponentRef}
            />
        );
    }
}

export const TableVisualization = injectIntl(TableVisualizationClass);
