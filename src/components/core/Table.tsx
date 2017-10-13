import * as React from 'react';
import get = require('lodash/get');
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import {
    ResponsiveTable,
    Table as IndigoTable,
    TableTransformation
} from '@gooddata/indigo-visualizations';
import {
    DataSource,
    DataSourceUtils,
    ResultSpecUtils,
    createSubject
} from '@gooddata/data-layer';
import { AFM, Execution } from '@gooddata/typings';

import { IntlWrapper } from './base/IntlWrapper';
import { IntlTranslationsProvider, ITranslationsComponentProps } from './base/TranslationsProvider';
import { fixEmptyHeaderItems } from './base/utils/fixEmptyHeaderItems';
import { IEvents, ILoadingState } from '../../interfaces/Events';
import { IDrillableItem } from '../../interfaces/DrillEvents';
import { IVisualizationProperties } from '../../interfaces/VisualizationProperties';
import { TablePropTypes, Requireable } from '../../proptypes/Table';

import { ErrorStates } from '../../constants/errorStates';
import { VisualizationEnvironment } from '../uri/Visualization';
import { getVisualizationOptions } from '../../helpers/options';
import { convertErrors, checkEmptyResult } from '../../helpers/errorHandlers';
import { ISubject } from '../../helpers/async';

export { Requireable };

export interface ITableProps extends IEvents {
    dataSource: DataSource.IDataSource<Execution.IExecutionResponses>;
    resultSpec?: AFM.IResultSpec;
    locale?: string;
    height?: number;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    drillableItems?: IDrillableItem[];
    afterRender?: Function;
    pushData?: Function;
    visualizationProperties?: IVisualizationProperties;
}

export interface ITableState {
    error: string;
    result: Execution.IExecutionResponses;
    isLoading: boolean;
    sortItems: AFM.SortItem[];
    page: number;
}

const ROWS_PER_PAGE_IN_RESPONSIVE_TABLE = 9;

export type ITableDataPromise = Promise<Execution.IExecutionResponses>;

const defaultErrorHandler = (error: any) => {
    if (error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
};

export class Table extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        resultSpec: {},
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        afterRender: noop,
        pushData: noop,
        stickyHeaderOffset: 0,
        height: 300,
        locale: 'en-US',
        environment: 'none',
        drillableItems: [],
        onFiredDrillEvent: noop,
        visualizationProperties: null
    };

    public static propTypes = TablePropTypes;

    private subject: ISubject<ITableDataPromise>;

    constructor(props: ITableProps) {
        super(props);

        this.state = {
            error: ErrorStates.OK,
            result: null,
            isLoading: false,
            sortItems: [],
            page: 1
        };

        this.onSortChange = this.onSortChange.bind(this);
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.onDataTooLarge = this.onDataTooLarge.bind(this);
        this.onError = this.onError.bind(this);
        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);

        this.subject = createSubject<Execution.IExecutionResponses>((result) => {
            this.setState({
                result
            });
            const options = getVisualizationOptions(this.props.dataSource.getAfm());
            this.props.pushData({
                result,
                options
            });
            this.onLoadingChanged({ isLoading: false });
        }, error => this.onError(error));
    }

    public componentDidMount() {
        const { dataSource, resultSpec } = this.props;
        this.initDataLoading(dataSource, resultSpec);
    }

    public componentWillReceiveProps(nextProps: ITableProps) {
        const sortItemsPrev = get<IVisualizationProperties, AFM.SortItem[]>(
            this.props.visualizationProperties, 'sortItems'
        );
        const sortItemsNext = get<IVisualizationProperties, AFM.SortItem[]>(
            nextProps.visualizationProperties, 'sortItems'
        );

        let localSortItems: AFM.SortItem[] = [];
        if (ResultSpecUtils.isSortValid(nextProps.dataSource.getAfm(), this.state.sortItems[0])) {
            localSortItems = this.state.sortItems;
        } else {
            this.setState({
                sortItems: []
            });
        }
        // next sorting needs to be different from previous and also
        // than actual inner sorting to get rid of duplicate execution
        // This handles only UNDO sorting change
        const sortingChanged = !isEqual(sortItemsPrev, sortItemsNext) && !isEqual(localSortItems, sortItemsNext);

        if (!DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource) || sortingChanged) {
            const sortItems = sortingChanged ? sortItemsNext : localSortItems;

            const { dataSource, resultSpec } = nextProps;
            this.initDataLoading(dataSource, resultSpec, sortItems);
        }
    }

    public componentWillUnmount() {
        this.subject.unsubscribe();
        this.onLoadingChanged = noop;
        this.onError = noop;
    }

    public onSortChange(sortItem: AFM.SortItem) {
        this.setState({
            sortItems: [sortItem]
        });

        const { dataSource, resultSpec } = this.props;
        this.props.pushData({
            properties: {
                sortItems: [sortItem]
            }
        });
        this.initDataLoading(dataSource, resultSpec, [sortItem]);
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

    public render() {
        if (!this.canRender()) {
            return null;
        }

        const tableRenderer = this.getTableRenderer();
        return this.renderTable(tableRenderer);
    }

    private getTableRenderer() {
        const { environment, height } = this.props;
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
                />
            );
        }

        return (props: ITableProps) => (
            <IndigoTable
                {...props}
                containerMaxHeight={height}
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
            locale,
            stickyHeaderOffset,
            environment,
            resultSpec,
            onFiredDrillEvent
        } = this.props;
        const { result, sortItems } = this.state;
        const {
            executionResponse,
            executionResult
        } = (result as Execution.IExecutionResponses);

        const onDataTooLarge = environment === 'dashboards' ? this.onDataTooLarge : noop;
        return (
            <IntlWrapper locale={locale}>
                <IntlTranslationsProvider>
                    {(props: ITranslationsComponentProps) => (
                        <TableTransformation
                            executionRequest={{
                                afm: dataSource.getAfm(),
                                resultSpec: ResultSpecUtils.applySorting(resultSpec, sortItems)
                            }}
                            executionResponse={executionResponse.executionResponse}
                            executionResult={
                                fixEmptyHeaderItems(executionResult, props.emptyHeaderString).executionResult
                            }
                            afterRender={afterRender}
                            config={{ stickyHeaderOffset }}
                            drillableItems={drillableItems}
                            height={height}
                            onDataTooLarge={onDataTooLarge}
                            tableRenderer={tableRenderer}
                            onFiredDrillEvent={onFiredDrillEvent}
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }

    private canRender() {
        const { result, isLoading, error } = this.state;
        return result && !isLoading && error === ErrorStates.OK;
    }

    private onError(errorCode: string, dataSource = this.props.dataSource, options = {}) {
        if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
            this.setState({
                error: errorCode
            });
            this.onLoadingChanged({ isLoading: false });
            this.props.onError({ status: errorCode, options });
        }
    }

    private onDataTooLarge() {
        this.onError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY);
    }

    private onLoadingChanged(loadingState: ILoadingState) {
        this.props.onLoadingChanged(loadingState);
        const isLoading = loadingState.isLoading;

        if (isLoading) {
            this.props.onError({ status: ErrorStates.OK }); // reset all errors in parent on loading start
            this.setState({
                isLoading,
                error: ErrorStates.OK // reset local errors
            });
        } else {
            this.setState({
                isLoading
            });
        }
    }

    private initDataLoading(
        dataSource: DataSource.IDataSource<Execution.IExecutionResponses>,
        resultSpec: AFM.IResultSpec,
        sortItems: AFM.SortItem[] = []
    ) {
        this.onLoadingChanged({ isLoading: true });

        const sortedResultSpec: AFM.IResultSpec = ResultSpecUtils.applySorting(resultSpec, sortItems);
        const promise = dataSource.getData(sortedResultSpec)
            .then(checkEmptyResult)
            .catch(convertErrors);

        this.subject.next(promise);
    }
}
