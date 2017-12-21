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
    createSubject
} from '@gooddata/data-layer';
import { AFM, Execution, VisualizationObject } from '@gooddata/typings';

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
import { IIndexedTotalItem } from '../../interfaces/Totals';
import { convertToIndexedTotals, convertToTotals } from '../../helpers/TotalsConverter';

export { Requireable };

export interface ITableProps extends IEvents {
    dataSource: DataSource.IDataSource<Execution.IExecutionResponses>;
    resultSpec?: AFM.IResultSpec;
    locale?: string;
    height?: number;
    maxHeight?: number;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    drillableItems?: IDrillableItem[];
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    onTotalsEdit?: Function;
    afterRender?: Function;
    pushData?: Function;
    visualizationProperties?: IVisualizationProperties;
    ErrorComponent?: React.ComponentClass<any>;
    LoadingComponent?: React.ComponentClass<any>;
}

export interface ITableState {
    error: string;
    result: Execution.IExecutionResponses;
    isLoading: boolean;
    page: number;
}

const ROWS_PER_PAGE_IN_RESPONSIVE_TABLE = 9;

export type ITableDataPromise = Promise<Execution.IExecutionResponses>;

const defaultErrorHandler = (error: any) => {
    if (error && error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
};

export class PureTable extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        resultSpec: {},
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        ErrorComponent: null,
        LoadingComponent: null,
        afterRender: noop,
        pushData: noop,
        stickyHeaderOffset: 0,
        height: null,
        maxHeight: null,
        locale: 'en-US',
        environment: 'none',
        drillableItems: [],
        totals: [],
        totalsEditAllowed: false,
        onTotalsEdit: noop,
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
            page: 1
        };

        this.onSortChange = this.onSortChange.bind(this);
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.onDataTooLarge = this.onDataTooLarge.bind(this);
        this.onError = this.onError.bind(this);
        this.onMore = this.onMore.bind(this);
        this.onLess = this.onLess.bind(this);
        this.onTotalsEdit = this.onTotalsEdit.bind(this);

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
        const resultSpecChanged = !isEqual(get(this.props, 'resultSpec'), get(nextProps, 'resultSpec'));

        if (!DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource) || resultSpecChanged) {
            const { dataSource, resultSpec } = nextProps;
            this.initDataLoading(dataSource, resultSpec);
        }
    }

    public componentWillUnmount() {
        this.subject.unsubscribe();
        this.onLoadingChanged = noop;
        this.onError = noop;
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

        // Short term solution (See BB-641)
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

    public render() {
        const { result, isLoading, error } = this.state;
        const { ErrorComponent, LoadingComponent } = this.props;

        if (error !== ErrorStates.OK) {
            return ErrorComponent ? <ErrorComponent error={{ status: error }} props={this.props} /> : null;
        }
        if (isLoading || !result) {
            return LoadingComponent ? <LoadingComponent props={this.props} /> : null;
        }

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
            totalsEditAllowed
        } = this.props;
        const { result } = this.state;
        const {
            executionResponse,
            executionResult
        } = (result as Execution.IExecutionResponses);

        // Short term solution (See BB-641)
        const indexedTotals = convertToIndexedTotals(totals, dataSource.getAfm(), resultSpec);

        const onDataTooLarge = environment === 'dashboards' ? this.onDataTooLarge : noop;
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
                        />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }

    private onError(errorCode: string, dataSource = this.props.dataSource) {
        if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
            const options = getVisualizationOptions(this.props.dataSource.getAfm());
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
        resultSpec: AFM.IResultSpec
    ) {
        this.onLoadingChanged({ isLoading: true });

        const promise = dataSource.getData(resultSpec)
            .then(checkEmptyResult)
            .catch(convertErrors);

        this.subject.next(promise);
    }
}
