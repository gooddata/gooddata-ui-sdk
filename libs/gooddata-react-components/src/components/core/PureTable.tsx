// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import difference = require("lodash/difference");
import uniq = require("lodash/uniq");
import get = require("lodash/get");
import { AFM, VisualizationObject } from "@gooddata/typings";

import { IntlWrapper } from "./base/IntlWrapper";
import { IntlTranslationsProvider, ITranslationsComponentProps } from "./base/TranslationsProvider";
import { fixEmptyHeaderItems } from "./base/utils/fixEmptyHeaderItems";
import { TablePropTypes } from "../../proptypes/Table";
import { VisualizationEnvironment } from "../uri/Visualization";
import { IIndexedTotalItem } from "../../interfaces/Totals";
import { convertToIndexedTotals, convertToTotals } from "../../helpers/TotalsConverter";
import { IDataSourceProviderInjectedProps } from "../afm/DataSourceProvider";

import {
    ICommonVisualizationProps,
    visualizationLoadingHOC,
    ILoadingInjectedProps,
    commonDefaultProps,
} from "./base/VisualizationLoadingHOC";
import { BaseVisualization } from "./base/BaseVisualization";
import { Table as IndigoTable, ITableProps as IIndigoTableProps } from "../visualizations/table/Table";
import { ResponsiveTable } from "../visualizations/table/ResponsiveTable";
import { TableTransformation } from "../visualizations/table/TableTransformation";

export interface ITableProps extends ICommonVisualizationProps {
    height?: number;
    maxHeight?: number;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    onTotalsEdit?: (indexedTotals: IIndexedTotalItem[]) => void;
}

export interface ITableState {
    page: number;
    pageOffset: number;
    lastAddedTotalType: AFM.TotalType;
}

const ROWS_PER_PAGE_IN_RESPONSIVE_TABLE = 9;

class SimpleTable extends BaseVisualization<
    ITableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps,
    ITableState
> {
    public static defaultProps: Partial<
        ITableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps
    > = {
        ...commonDefaultProps,
        stickyHeaderOffset: 0,
        height: null,
        maxHeight: null,
        environment: "none",
        totals: [],
        totalsEditAllowed: false,
        onTotalsEdit: noop,
        onDataTooLarge: noop,
    };

    public static propTypes = TablePropTypes;

    constructor(props: ITableProps & ILoadingInjectedProps & IDataSourceProviderInjectedProps) {
        super(props);

        this.state = {
            page: 1,
            pageOffset: 0,
            lastAddedTotalType: null,
        };

        this.onSortChange = this.onSortChange.bind(this);
        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);
        this.onTotalsEdit = this.onTotalsEdit.bind(this);
        this.resetLastAddedTotalType = this.resetLastAddedTotalType.bind(this);
    }

    public componentWillReceiveProps(nextProps: ITableProps) {
        if (this.props.totals.length !== nextProps.totals.length) {
            const totalsTypes = uniq(this.props.totals.map(total => total.type));
            const nextTotalsTypes = uniq(nextProps.totals.map(total => total.type));

            this.setState({ lastAddedTotalType: difference(nextTotalsTypes, totalsTypes)[0] });
        }
    }

    public resetLastAddedTotalType() {
        this.setState({ lastAddedTotalType: null });
    }

    public onSortChange(sortItem: AFM.SortItem) {
        this.props.pushData({
            properties: {
                sortItems: [sortItem],
            },
        });
    }

    public onTotalsEdit(indexedTotals: IIndexedTotalItem[]) {
        const { dataSource, pushData } = this.props;

        const totals = convertToTotals(indexedTotals, dataSource.getAfm());

        pushData({
            properties: {
                totals,
            },
        });
    }

    public onMore({ page, pageOffset }: { page: number; pageOffset: number }) {
        this.setState({
            page,
            pageOffset,
        });
    }

    public onLess() {
        this.setState({
            page: 1,
            pageOffset: 0,
        });
    }

    protected renderVisualization(): JSX.Element {
        const tableRenderer = this.getTableRenderer();
        return this.renderTable(tableRenderer);
    }

    private getTableRenderer() {
        const { environment, maxHeight } = this.props;
        const { page, pageOffset } = this.state;

        if (environment === "dashboards") {
            return (props: IIndigoTableProps) => (
                <ResponsiveTable
                    {...props}
                    rows={props.rows || []}
                    rowsPerPage={ROWS_PER_PAGE_IN_RESPONSIVE_TABLE}
                    page={page}
                    pageOffset={pageOffset}
                    onMore={this.onMore}
                    onLess={this.onLess}
                    onSortChange={this.onSortChange}
                    executionRequest={this.getExecutionRequest()}
                />
            );
        }

        return (props: IIndigoTableProps) => (
            <IndigoTable
                {...props}
                containerMaxHeight={maxHeight}
                onSortChange={this.onSortChange}
                executionRequest={this.getExecutionRequest()}
            />
        );
    }

    private getExecutionRequest() {
        return {
            execution: {
                afm: this.props.dataSource.getAfm(),
                resultSpec: this.props.resultSpec,
            },
        };
    }

    private renderTable(tableRenderer: (props: IIndigoTableProps) => any) {
        const {
            afterRender,
            dataSource,
            drillableItems,
            height,
            maxHeight,
            locale,
            stickyHeaderOffset,
            environment,
            resultSpec,
            onFiredDrillEvent,
            totals,
            totalsEditAllowed,
            execution,
        } = this.props;

        const separators = get(this.props, "config.separators", undefined);
        const onDataTooLarge = environment === "dashboards" ? this.props.onDataTooLarge : noop;

        // Short term solution (See BB-641)
        const indexedTotals = convertToIndexedTotals(totals, dataSource.getAfm(), resultSpec);

        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <TableTransformation
                            executionRequest={this.getExecutionRequest()}
                            executionResponse={execution.executionResponse}
                            executionResult={fixEmptyHeaderItems(
                                execution.executionResult,
                                props.emptyHeaderString,
                            )}
                            afterRender={afterRender}
                            config={{ stickyHeaderOffset, separators }}
                            drillableItems={drillableItems}
                            height={height}
                            maxHeight={maxHeight}
                            onDataTooLarge={onDataTooLarge}
                            tableRenderer={tableRenderer}
                            onFiredDrillEvent={onFiredDrillEvent}
                            totals={indexedTotals}
                            totalsEditAllowed={totalsEditAllowed}
                            onTotalsEdit={this.onTotalsEdit}
                            lastAddedTotalType={this.state.lastAddedTotalType}
                            onLastAddedTotalRowHighlightPeriodEnd={this.resetLastAddedTotalType}
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

export const PureTable = visualizationLoadingHOC(SimpleTable);
