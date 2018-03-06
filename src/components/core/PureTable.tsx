import * as React from 'react';
import noop = require('lodash/noop');
import difference = require('lodash/difference');
import uniq = require('lodash/uniq');

import {
    ResponsiveTable,
    Table as IndigoTable,
    TableTransformation
} from '@gooddata/indigo-visualizations';
import { AFM, VisualizationObject } from '@gooddata/typings';

import { IntlWrapper } from './base/IntlWrapper';
import {
    IntlTranslationsProvider,
    ITranslationsComponentProps
} from './base/TranslationsProvider';
import { fixEmptyHeaderItems } from './base/utils/fixEmptyHeaderItems';
import { TablePropTypes } from '../../proptypes/Table';
import { VisualizationEnvironment } from '../uri/Visualization';
import { IIndexedTotalItem } from '../../interfaces/Totals';
import { convertToIndexedTotals, convertToTotals } from '../../helpers/TotalsConverter';

import {
    ICommonVisualizationProps,
    visualizationLoadingHOC,
    ILoadingInjectedProps,
    commonDefaultprops
} from './base/VisualizationLoadingHOC';

export interface ITableProps extends ICommonVisualizationProps {
    height?: number;
    maxHeight?: number;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    onTotalsEdit?: Function;
}

export interface ITableState {
    page: number;
    lastAddedTotalType: string;
}

const ROWS_PER_PAGE_IN_RESPONSIVE_TABLE = 9;

class SimpleTable extends React.Component<ITableProps & ILoadingInjectedProps, ITableState> {
    public static defaultProps: Partial<ITableProps & ILoadingInjectedProps> = {
        ...commonDefaultprops,
        stickyHeaderOffset: 0,
        height: null,
        maxHeight: null,
        environment: 'none',
        totals: [],
        totalsEditAllowed: false,
        onTotalsEdit: noop,
        visualizationProperties: null,
        onDataTooLarge: noop
    };

    public static propTypes = TablePropTypes;

    constructor(props: ITableProps & ILoadingInjectedProps) {
        super(props);

        this.state = {
            page: 1,
            lastAddedTotalType: ''
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
        this.setState({ lastAddedTotalType: '' });
    }

    public onSortChange(sortItem: AFM.SortItem) {
        this.props.pushData({
            properties: {
                sortItems: [sortItem]
            }
        });
    }

    public onTotalsEdit(indexedTotals: IIndexedTotalItem[]) {
        const { dataSource, pushData } = this.props;

        const totals = convertToTotals(indexedTotals, dataSource.getAfm());

        pushData({
            properties: {
                totals
            }
        });
    }

    public onMore({ page }: { page: number }) {
        this.setState({
            page
        });
    }

    public onLess() {
        this.setState({
            page: 1
        });
    }

    public render(): JSX.Element {
        const tableRenderer = this.getTableRenderer();
        return this.renderTable(tableRenderer);
    }

    private getTableRenderer() {
        const { environment, totals, maxHeight } = this.props;
        const { page } = this.state;

        if (environment === 'dashboards') {
            return (props: ITableProps) => (
                <ResponsiveTable
                    {...props}
                    onSortChange={this.onSortChange}
                    rowsPerPage={ROWS_PER_PAGE_IN_RESPONSIVE_TABLE}
                    page={page}
                    onMore={this.onMore}
                    onLess={this.onLess}
                    totals={totals}
                />
            );
        }

        return (props: ITableProps) => (
            <IndigoTable
                {...props}
                containerMaxHeight={maxHeight}
                onSortChange={this.onSortChange}
            />
        );
    }

    private renderTable(tableRenderer: Function) {
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
            executionResponse,
            executionResult
        } = this.props;

        // Short term solution (See BB-641)
        const indexedTotals = convertToIndexedTotals(totals, dataSource.getAfm(), resultSpec);

        const onDataTooLarge = environment === 'dashboards' ? this.props.onDataTooLarge : noop;
        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <TableTransformation
                            executionRequest={{
                                afm: dataSource.getAfm(),
                                resultSpec
                            }}
                            executionResponse={executionResponse.executionResponse}
                            executionResult={
                                fixEmptyHeaderItems(executionResult, props.emptyHeaderString).executionResult
                            }
                            afterRender={afterRender}
                            config={{ stickyHeaderOffset }}
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
