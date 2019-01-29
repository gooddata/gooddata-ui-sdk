// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { DataLayer, ApiResponseError } from '@gooddata/gooddata-js';
import { AFM, Execution } from '@gooddata/typings';

import { ErrorStates } from '../../../constants/errorStates';
import { IEvents, ILoadingState } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { ISubject } from '../../../helpers/async';
import { convertErrors, checkEmptyResult } from '../../../helpers/errorHandlers';
import { IHeaderPredicate } from '../../../interfaces/HeaderPredicate';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';
import { injectIntl, InjectedIntl } from 'react-intl';
import { IntlWrapper } from '../../core/base/IntlWrapper';

import { LoadingComponent, ILoadingProps } from '../../simple/LoadingComponent';
import { ErrorComponent, IErrorProps } from '../../simple/ErrorComponent';
import { RuntimeError } from '../../../errors/RuntimeError';
import { IPushData } from '../../../interfaces/PushData';
import { IChartConfig } from '../../../interfaces/Config';

export type IExecutionDataPromise = Promise<Execution.IExecutionResponses>;

export interface ICommonVisualizationProps extends IEvents {
    locale?: string;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    afterRender?: () => void;
    pushData?: (data: IPushData) => void;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    config?: IChartConfig;
}

export type IGetPage = (
    resultSpec: AFM.IResultSpec,
    limit: number[],
    offset: number[]
) => Promise<Execution.IExecutionResponses | null>;

export interface ILoadingInjectedProps {
    execution: Execution.IExecutionResponses;
    error?: string;
    isLoading: boolean;
    intl: InjectedIntl;
    // if autoExecuteDataSource is false, this callback is passed to the inner component and handles loading
    getPage?: IGetPage;
    onDataTooLarge(): void;
    onNegativeValues(): void;
}

export interface IVisualizationLoadingState {
    error?: string;
    result?: Execution.IExecutionResponses;
    isLoading: boolean;
}

const defaultErrorHandler = (error: any) => {
    // if error was not placed in object, we couldnt see its properties in console (ie cause, responseText etc.)
    console.error('Error in execution:', { error }); // tslint:disable-line no-console
};

export const commonDefaultProps: Partial<ICommonVisualizationProps & IDataSourceProviderInjectedProps> = {
    resultSpec: undefined,
    onError: defaultErrorHandler,
    onLoadingChanged: noop,
    ErrorComponent,
    LoadingComponent,
    afterRender: noop,
    pushData: noop,
    locale: 'en-US',
    drillableItems: [],
    onFiredDrillEvent: () => true
};

export function visualizationLoadingHOC<T extends ICommonVisualizationProps & IDataSourceProviderInjectedProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>,
    autoExecuteDataSource: boolean = true
): React.ComponentClass<T> {
    class LoadingHOCWrapped
        extends React.Component<T & ILoadingInjectedProps, IVisualizationLoadingState> {

        public static defaultProps: Partial<T & ILoadingInjectedProps> = InnerComponent.defaultProps;

        protected subject: ISubject<IExecutionDataPromise>;
        protected pagePromises: IExecutionDataPromise[];
        protected hasUnmounted: boolean;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                isLoading: false,
                result: null,
                error: null
            };
            this.pagePromises = [];
            this.hasUnmounted = false;

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);
            this.getPage = this.getPage.bind(this);
            this.cancelPagePromises = this.cancelPagePromises.bind(this);

            this.initSubject();
        }

        public componentDidMount() {
            const { dataSource, resultSpec } = this.props;
            if (autoExecuteDataSource) {
                this.initDataLoading(dataSource, resultSpec);
            } else {
                // without this, the ReportVisualization component doesn't assign executionId
                // and doesn't match results to executions and never stops loading
                this.onLoadingChanged({ isLoading: true });
            }
        }

        public render() {
            const { result, isLoading, error } = this.state;
            const { intl } = this.props;

            const getPageProperty = autoExecuteDataSource
                ? {}
                : {
                    getPage: this.getPage,
                    cancelPagePromises: this.cancelPagePromises
                };

            return (
                <InnerComponent
                    key="InnerComponent"
                    {...this.props}
                    execution={result}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                    error={error}
                    isLoading={isLoading}
                    intl={intl}
                    {...getPageProperty}
                />
            );
        }

        public cancelPagePromises() {
            this.pagePromises = []; // dumping this array of getPage promises will result in effectively cancelling them
        }

        public getPage(
            resultSpec: AFM.IResultSpec,
            limit: number[],
            offset: number[]
        ): Promise<Execution.IExecutionResponses> {
            if (this.hasUnmounted) {
                return Promise.resolve(null);
            }
            this.setState({ error: null });

            const pagePromise = this.createPagePromise(resultSpec, limit, offset);

            return pagePromise
                .then(checkEmptyResult)
                .then((result: Execution.IExecutionResponses) => {
                    // This returns only current page,
                    // gooddata-js mergePages doesn't support discontinuous page ranges yet
                    this.setState({ result, error: null });
                    this.props.pushData({
                        result
                    });
                    this.onLoadingChanged({ isLoading: false });
                    return result;
                })
                .catch((error: ApiResponseError | Error) => {
                    // only trigger errors on non-cancelled promises
                    if (error.message !== ErrorStates.CANCELLED) {
                        this.onError(convertErrors(error));
                    }
                });
        }

        public isDataReloadRequired(nextProps: Readonly<T & ILoadingInjectedProps>) {
            return !DataLayer.DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)
                || !isEqual(this.props.resultSpec, nextProps.resultSpec);
        }

        public componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (this.isDataReloadRequired(nextProps)) {
                if (autoExecuteDataSource) {
                    const { dataSource, resultSpec } = nextProps;
                    this.initDataLoading(dataSource, resultSpec);
                } else {
                    this.onLoadingChanged({ isLoading: true });
                }
            }
        }

        public componentWillUnmount() {
            this.hasUnmounted = true;
            this.subject.unsubscribe();
            this.cancelPagePromises();
            this.getPage = () => Promise.resolve(null);
            this.cancelPagePromises = noop;
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private createPagePromise(
            resultSpec: AFM.IResultSpec,
            limit: number[],
            offset: number[]
        ): Promise<Execution.IExecutionResponses> {
            const pagePromise = this.props.dataSource.getPage(resultSpec, limit, offset);
            this.pagePromises.push(pagePromise);
            return pagePromise.then((result: Execution.IExecutionResponses) => {
                if (this.isCancelled(pagePromise)) {
                    this.removePagePromise(pagePromise);
                    return result;
                } else {
                    throw new Error(ErrorStates.CANCELLED);
                }
            });
        }

        private isCancelled(pagePromise: Promise<Execution.IExecutionResponses>) {
            return this.pagePromises.includes(pagePromise);
        }

        private removePagePromise =
        (promise: IExecutionDataPromise) => {
            const promiseIndex = this.pagePromises.indexOf(promise);
            if (promiseIndex > -1) {
                this.pagePromises = this.pagePromises
                    .slice(0, promiseIndex)
                    .concat(this.pagePromises.slice(promiseIndex + 1));
            }
        }

        private initSubject() {
            this.subject = DataLayer.createSubject<Execution.IExecutionResponses>((result) => {
                this.setState({ result });
                this.props.pushData({ result });
                this.onLoadingChanged({ isLoading: false });
            }, error => this.onError(error));
        }

        private onLoadingChanged(loadingState: ILoadingState) {
            this.props.onLoadingChanged(loadingState);

            const { isLoading } = loadingState;

            const state: IVisualizationLoadingState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private onError(error: RuntimeError, dataSource = this.props.dataSource) {
            if (DataLayer.DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
                this.setState({ error: error.getMessage() });
                this.onLoadingChanged({ isLoading: false });

                this.props.onError(error);
            }
        }

        private onDataTooLarge() {
            this.onError(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY));
        }

        private onNegativeValues() {
            this.onError(new RuntimeError(ErrorStates.NEGATIVE_VALUES));
        }

        private initDataLoading(
            dataSource: DataLayer.DataSource.IDataSource<Execution.IExecutionResponses>,
            resultSpec: AFM.IResultSpec
        ) {
            this.onLoadingChanged({ isLoading: true });
            this.setState({ result: null });

            const promise = dataSource.getData(resultSpec)
                .then(checkEmptyResult)
                .catch((error: ApiResponseError) => {
                    throw convertErrors(error);
                });

            this.subject.next(promise);
        }
    }

    const IntlLoadingHOC = injectIntl(LoadingHOCWrapped);

    return class LoadingHOC extends React.Component<T & ILoadingInjectedProps, null> {
        public render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlLoadingHOC {...this.props}/>
                </IntlWrapper>
            );
        }
    };
}
