import * as React from 'react';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import {
    DataSource,
    DataSourceUtils,
    createSubject
} from '@gooddata/data-layer';
import { AFM, Execution } from '@gooddata/typings';
import { ErrorStates } from '../../../constants/errorStates';
import { IEvents, ILoadingState } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { ISubject } from '../../../helpers/async';
import { getVisualizationOptions } from '../../../helpers/options';
import { convertErrors, checkEmptyResult } from '../../../helpers/errorHandlers';
import { IVisualizationProperties } from '../../../interfaces/VisualizationProperties';

export type IExecutionDataPromise = Promise<Execution.IExecutionResponses>;

export interface ICommonVisualizationProps extends IEvents {
    dataSource: DataSource.IDataSource<Execution.IExecutionResponses>;
    resultSpec?: AFM.IResultSpec;
    locale?: string;
    drillableItems?: IDrillableItem[];
    afterRender?: Function;
    pushData?: Function;
    ErrorComponent?: React.ComponentClass<any>;
    LoadingComponent?: React.ComponentClass<any>;
    visualizationProperties?: IVisualizationProperties;
}

export interface ILoadingInjectedProps {
    executionResponse: Execution.IExecutionResponse;
    executionResult: Execution.IExecutionResult;
    onDataTooLarge: Function;
    onNegativeValues: Function;
}

export interface IVisualizationLoadingState {
    error: string;
    result: Execution.IExecutionResponses;
    isLoading: boolean;
}

const defaultErrorHandler = (error: any) => {
    if (error && error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
};

export const commonDefaultprops: Partial<ICommonVisualizationProps> = {
    resultSpec: {},
    onError: defaultErrorHandler,
    onLoadingChanged: noop,
    ErrorComponent: null,
    LoadingComponent: null,
    afterRender: noop,
    pushData: noop,
    locale: 'en-US',
    drillableItems: [],
    onFiredDrillEvent: noop
};

export function visualizationLoadingHOC<T extends ICommonVisualizationProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>
): React.ComponentClass<T> {

    return class WrappedComponent
        extends React.Component<T & ILoadingInjectedProps, IVisualizationLoadingState> {

        public static defaultProps: Partial<T & ILoadingInjectedProps> = InnerComponent.defaultProps;

        protected subject: ISubject<IExecutionDataPromise>;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                error: ErrorStates.OK,
                result: null,
                isLoading: false
            };

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);

            this.initSubject();
        }

        public componentDidMount() {
            const { dataSource, resultSpec } = this.props;
            this.initDataLoading(dataSource, resultSpec);
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

            const {
                executionResponse,
                executionResult
            } = (result as Execution.IExecutionResponses);
            return (
                <InnerComponent
                    {...this.props}
                    executionResponse={executionResponse}
                    executionResult={executionResult}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                />
            );
        }

        public isDataReloadRequired(nextProps: Readonly<T & ILoadingInjectedProps>) {
            return !DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)
                || !isEqual(this.props.resultSpec, nextProps.resultSpec);
        }

        public componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (this.isDataReloadRequired(nextProps)) {
                const { dataSource, resultSpec } = nextProps;
                this.initDataLoading(dataSource, resultSpec);
            }
        }

        public componentWillUnmount() {
            this.subject.unsubscribe();
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private initSubject() {
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

        private onLoadingChanged(loadingState: ILoadingState) {
            this.props.onLoadingChanged(loadingState);
            const isLoading = loadingState.isLoading;

            if (isLoading) {
                this.props.onError({ status: ErrorStates.OK });
                this.setState({
                    isLoading,
                    error: ErrorStates.OK
                });
            } else {
                this.setState({
                    isLoading
                });
            }
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

        private initDataLoading(
            dataSource: DataSource.IDataSource<Execution.IExecutionResponses>,
            resultSpec: AFM.IResultSpec
        ) {
            this.onLoadingChanged({ isLoading: true });
            this.setState({ result: null });

            const promise = dataSource.getData(resultSpec)
                .then(checkEmptyResult)
                .catch(convertErrors);

            this.subject.next(promise);
        }

        private onNegativeValues() {
            this.onError(ErrorStates.NEGATIVE_VALUES);
        }
    };
}
